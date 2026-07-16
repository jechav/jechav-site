import Database from 'better-sqlite3';

export interface Prompt {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS prompts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS tags (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS prompt_tags (
    prompt_id INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    tag_id    INTEGER NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
    PRIMARY KEY (prompt_id, tag_id)
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS prompts_fts USING fts5(
    title, content, content=prompts, content_rowid=id
  );
`;

export function createDB(filePath: string) {
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);

  // Migrate existing databases: add deleted_at column if it doesn't exist
  const hasDeletedAt = db.prepare(`PRAGMA table_info(prompts)`).all().some((col: any) => col.name === 'deleted_at');
  if (!hasDeletedAt) {
    db.exec(`ALTER TABLE prompts ADD COLUMN deleted_at TEXT;`);
  }

  function upsertTags(names: string[]): number[] {
    const insert = db.prepare(`INSERT OR IGNORE INTO tags (name) VALUES (?)`);
    const find   = db.prepare(`SELECT id FROM tags WHERE name = ?`);
    return names.map((name) => {
      insert.run(name);
      return (find.get(name) as { id: number }).id;
    });
  }

  function createPrompt(title: string, content: string, tags: string[]): Prompt {
    const result = db
      .prepare(`INSERT INTO prompts (title, content) VALUES (?, ?) RETURNING id, title, content, created_at`)
      .get(title, content) as { id: number; title: string; content: string; created_at: string };

    const tagIds = upsertTags(tags);
    const link = db.prepare(`INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)`);
    for (const tagId of tagIds) link.run(result.id, tagId);

    db.prepare(`INSERT INTO prompts_fts (rowid, title, content) VALUES (?, ?, ?)`).run(result.id, title, content);

    return { id: result.id, title: result.title, content: result.content, tags, createdAt: result.created_at };
  }

  function getPrompts(opts: { q?: string; tags?: string[] } = {}): Prompt[] {
    const { q, tags } = opts;
    const conditions: string[] = ['p.deleted_at IS NULL'];
    const bindings: (string | number)[] = [];

    if (q) {
      conditions.push(`p.id IN (SELECT rowid FROM prompts_fts WHERE prompts_fts MATCH ?)`);
      bindings.push(`"${q.replace(/"/g, '""')}"`);
    }

    if (tags && tags.length > 0) {
      const placeholders = tags.map(() => '?').join(',');
      conditions.push(`p.id IN (
        SELECT pt.prompt_id FROM prompt_tags pt
        JOIN tags t ON t.id = pt.tag_id
        WHERE t.name IN (${placeholders})
      )`);
      bindings.push(...tags);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const rows = db.prepare(`
      SELECT p.id, p.title, p.content, p.created_at,
             GROUP_CONCAT(t.name) AS tag_names
      FROM   prompts p
      LEFT   JOIN prompt_tags pt ON pt.prompt_id = p.id
      LEFT   JOIN tags t         ON t.id = pt.tag_id
      ${where}
      GROUP  BY p.id
      ORDER  BY p.created_at DESC
    `).all(...bindings) as { id: number; title: string; content: string; created_at: string; tag_names: string | null }[];

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      tags: row.tag_names ? row.tag_names.split(',') : [],
    }));
  }

  function deletePrompt(id: number): boolean {
    const exists = db.prepare(`SELECT id FROM prompts WHERE id = ?`).get(id);
    if (!exists) return false;
    db.prepare(`UPDATE prompts SET deleted_at = datetime('now') WHERE id = ?`).run(id);
    return true;
  }

  function restorePrompt(id: number): boolean {
    const exists = db.prepare(`SELECT id FROM prompts WHERE id = ? AND deleted_at IS NOT NULL`).get(id);
    if (!exists) return false;
    db.prepare(`UPDATE prompts SET deleted_at = NULL WHERE id = ?`).run(id);
    return true;
  }

  function permanentlyDeletePrompt(id: number): boolean {
    const exists = db.prepare(`SELECT id FROM prompts WHERE id = ?`).get(id);
    if (!exists) return false;
    db.prepare(`DELETE FROM prompts_fts WHERE rowid = ?`).run(id);
    db.prepare(`DELETE FROM prompts WHERE id = ?`).run(id);
    return true;
  }

  function getDeletedPrompts(): Prompt[] {
    const rows = db.prepare(`
      SELECT p.id, p.title, p.content, p.created_at,
             GROUP_CONCAT(t.name) AS tag_names
      FROM   prompts p
      LEFT   JOIN prompt_tags pt ON pt.prompt_id = p.id
      LEFT   JOIN tags t         ON t.id = pt.tag_id
      WHERE  p.deleted_at IS NOT NULL
      GROUP  BY p.id
      ORDER  BY p.deleted_at DESC
    `).all() as { id: number; title: string; content: string; created_at: string; tag_names: string | null }[];

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      tags: row.tag_names ? row.tag_names.split(',') : [],
    }));
  }

  function updatePrompt(id: number, title: string, content: string, tags: string[]): Prompt | null {
    const exists = db.prepare(`SELECT id FROM prompts WHERE id = ?`).get(id);
    if (!exists) return null;

    db.prepare(`UPDATE prompts SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(title, content, id);

    // Replace tag associations
    db.prepare(`DELETE FROM prompt_tags WHERE prompt_id = ?`).run(id);
    const tagIds = upsertTags(tags);
    const link = db.prepare(`INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)`);
    for (const tagId of tagIds) link.run(id, tagId);

    // Update FTS index
    db.prepare(`DELETE FROM prompts_fts WHERE rowid = ?`).run(id);
    db.prepare(`INSERT INTO prompts_fts (rowid, title, content) VALUES (?, ?, ?)`).run(id, title, content);

    return { id, title, content, tags, createdAt: (exists as any).created_at ?? '' };
  }

  function getTags(q?: string): string[] {
    if (q) {
      return (db.prepare(`SELECT name FROM tags WHERE name LIKE ? ORDER BY name`)
        .all(`%${q}%`) as { name: string }[]).map((r) => r.name);
    }
    return (db.prepare(`SELECT name FROM tags ORDER BY name`).all() as { name: string }[]).map((r) => r.name);
  }

  return { createPrompt, getPrompts, updatePrompt, deletePrompt, restorePrompt, permanentlyDeletePrompt, getDeletedPrompts, getTags };
}
