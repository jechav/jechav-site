import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDB } from '../lib/db';
import IndexPage from './index.astro';

let dir: string;
let db: ReturnType<typeof createDB>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'prompts-filter-test-'));
  db = createDB(join(dir, 'prompts.db'));
  db.createPrompt('Write a poem', 'Write a short haiku about autumn.', ['writing', 'creative']);
  db.createPrompt('Debug helper', 'Explain this error and suggest a fix.', ['coding']);
  db.createPrompt('Code review', 'Review this code for issues.', ['coding', 'writing']);
});

afterEach(() => {
  rmSync(dir, { recursive: true });
});

async function renderListing(search: string) {
  const container = await AstroContainer.create();
  return container.renderToString(IndexPage, {
    request: new Request(`http://localhost/${search}`),
    locals: { db, isAuthenticated: false },
  });
}

describe('Listing search', () => {
  it('shows only Prompts matching the search query', async () => {
    const html = await renderListing('?q=haiku');
    expect(html).toContain('Write a poem');
    expect(html).not.toContain('Debug helper');
    expect(html).not.toContain('Code review');
  });

  it('shows an empty Listing when no Prompts match', async () => {
    const html = await renderListing('?q=zzznomatch');
    expect(html).not.toContain('Write a poem');
    expect(html).not.toContain('Debug helper');
  });
});

describe('Listing tag filter', () => {
  it('shows only Prompts that have the selected tag', async () => {
    const html = await renderListing('?tags=creative');
    expect(html).toContain('Write a poem');
    expect(html).not.toContain('Debug helper');
    expect(html).not.toContain('Code review');
  });

  it('uses OR logic — shows Prompts with any of the selected tags', async () => {
    const html = await renderListing('?tags=creative&tags=coding');
    expect(html).toContain('Write a poem');
    expect(html).toContain('Debug helper');
    expect(html).toContain('Code review');
  });

  it('applies search and tag filter simultaneously', async () => {
    const html = await renderListing('?q=error&tags=coding');
    expect(html).toContain('Debug helper');
    expect(html).not.toContain('Write a poem');
    expect(html).not.toContain('Code review');
  });
});
