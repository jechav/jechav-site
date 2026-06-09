import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDB } from '../lib/db';
import { GET } from './api/tags';

let dir: string;
let db: ReturnType<typeof createDB>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'prompts-tags-test-'));
  db = createDB(join(dir, 'prompts.db'));
  db.createPrompt('Poem', 'Write a haiku.', ['writing', 'creative']);
  db.createPrompt('Debug', 'Explain error.', ['coding', 'writing']);
});

afterEach(() => {
  rmSync(dir, { recursive: true });
});

const ctx = (q?: string) => ({
  request: new Request(`http://localhost/api/tags${q ? `?q=${q}` : ''}`),
  url: new URL(`http://localhost/api/tags${q ? `?q=${q}` : ''}`),
  locals: { db },
} as any);

describe('GET /api/tags', () => {
  it('returns all tags when no query is given', async () => {
    const response = await GET(ctx());
    const body = await response.json();
    expect(body).toEqual(expect.arrayContaining(['writing', 'creative', 'coding']));
    expect(body).toHaveLength(3);
  });

  it('returns only matching tags when ?q is given', async () => {
    const response = await GET(ctx('wri'));
    const body = await response.json();
    expect(body).toEqual(['writing']);
  });
});
