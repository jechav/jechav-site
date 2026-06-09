import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createAuth } from '../lib/auth';
import { createDB } from '../lib/db';
import { PUT } from './api/prompts.[id]';

const TEST_PASSWORD = 'test-password';
const auth = createAuth(TEST_PASSWORD);

let dir: string;
let db: ReturnType<typeof createDB>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'prompts-edit-test-'));
  db = createDB(join(dir, 'prompts.db'));
});

afterEach(() => {
  rmSync(dir, { recursive: true });
});

function makeRequest(id: string | number, fields: Record<string, string>, authenticated = true) {
  const cookie = authenticated ? `session=${auth.sessionToken()}` : '';
  return {
    request: new Request(`http://localhost/api/prompts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(cookie ? { cookie } : {}),
      },
      body: new URLSearchParams(fields).toString(),
    }),
    locals: { auth, db },
    params: { id: String(id) },
    redirect: (url: string) => new Response(null, { status: 302, headers: { location: url } }),
  } as any;
}

describe('PUT /api/prompts/:id', () => {
  it('updates the Prompt and returns 200 with updated data', async () => {
    const { id } = db.createPrompt('Old title', 'Old content', ['old-tag']);

    const response = await PUT(makeRequest(id, {
      title: 'New title',
      content: 'New content',
      tags: 'new-tag,another',
    }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.title).toBe('New title');
    expect(body.tags).toEqual(['new-tag', 'another']);
  });

  it('returns 404 for a non-existent Prompt id', async () => {
    const response = await PUT(makeRequest(999, { title: 'X', content: 'Y', tags: '' }));
    expect(response.status).toBe(404);
  });

  it('redirects to /login when unauthenticated', async () => {
    const response = await PUT(makeRequest(1, { title: 'X', content: 'Y', tags: '' }, false));
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/login');
  });
});
