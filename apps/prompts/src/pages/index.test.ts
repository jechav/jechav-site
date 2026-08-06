import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDB } from '../lib/db';
import IndexPage from './index.astro';

async function renderListing(db: ReturnType<typeof createDB>) {
  const container = await AstroContainer.create();
  const response = await container.renderToString(IndexPage, {
    locals: { db, isAuthenticated: false },
  });
  return response;
}

describe('Listing page', () => {
  let dir: string;
  let db: ReturnType<typeof createDB>;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'prompts-listing-test-'));
    db = createDB(join(dir, 'prompts.db'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true });
  });

  it('renders one Prompt Card per Prompt in the library', async () => {
    db.createPrompt('Write a poem', 'Write a short haiku about autumn.', ['writing']);
    db.createPrompt('Debug helper', 'Explain this error and suggest a fix.', ['coding']);

    const html = await renderListing(db);

    expect(html).toContain('Write a poem');
    expect(html).toContain('Debug helper');
  });

  it('renders the title, a content preview, and Tags on each Prompt Card', async () => {
    db.createPrompt('Write a poem', 'Write a short haiku about autumn.', ['writing', 'creative']);

    const html = await renderListing(db);

    expect(html).toContain('Write a poem');
    expect(html).toContain('Write a short haiku');
    expect(html).toContain('writing');
    expect(html).toContain('creative');
  });

  it('renders without error when the library has no Prompts', async () => {
    const html = await renderListing(db);
    expect(html).toBeTruthy();
  });

  it('stacks the authenticated empty-state message and action', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(IndexPage, {
      locals: { db, isAuthenticated: true },
    });

    expect(html).toMatch(/<p[^>]*>No prompts yet\.<\/p>/);
    expect(html).toMatch(/class="btn btn--primary empty-state__action"/);
  });

  it('keeps delete confirmation controls hidden until deletion is selected', () => {
    const modalSource = readFileSync(
      new URL('../components/PromptModal.astro', import.meta.url),
      'utf8',
    );

    expect(modalSource).toContain('.delete-confirm[hidden] { display: none; }');
  });
});
