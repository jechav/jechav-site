import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDB } from './db';

let dir: string;
let db: ReturnType<typeof createDB>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'prompts-test-'));
  db = createDB(join(dir, 'prompts.db'));
});

afterEach(() => {
  rmSync(dir, { recursive: true });
});

describe('getPrompts', () => {
  it('returns all Prompts with their Tags', () => {
    db.createPrompt('Write a poem', 'Write a short haiku about autumn.', ['writing', 'creative']);
    db.createPrompt('Debug helper', 'Explain this error and suggest a fix.', ['coding']);

    const prompts = db.getPrompts();

    expect(prompts).toHaveLength(2);
    expect(prompts[0].title).toBe('Write a poem');
    expect(prompts[0].tags).toEqual(['writing', 'creative']);
    expect(prompts[1].title).toBe('Debug helper');
    expect(prompts[1].tags).toEqual(['coding']);
  });

  it('returns an empty array when there are no Prompts', () => {
    expect(db.getPrompts()).toEqual([]);
  });
});
