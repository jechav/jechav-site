import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createAuth } from '../lib/auth';
import { createDB } from '../lib/db';
import { DELETE } from './api/prompts/[id]';

const TEST_PASSWORD = 'test-password';
const auth = createAuth(TEST_PASSWORD);

let dir: string;
let db: ReturnType<typeof createDB>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'prompts-delete-test-'));
  db = createDB(join(dir, 'prompts.db'));
});

afterEach(() => {
  rmSync(dir, { recursive: true });
});

function makeRequest(id: string | number, authenticated = true) {
  const cookie = authenticated ? `session=${auth.sessionToken()}` : '';
  return {
    request: new Request(`http://localhost/api/prompts/${id}`, {
      method: 'DELETE',
      headers: cookie ? { cookie } : {},
    }),
    locals: { auth, db },
    params: { id: String(id) },
    redirect: (url: string) => new Response(null, { status: 302, headers: { location: url } }),
  } as any;
}

describe('DELETE /api/prompts/:id', () => {
  it('deletes the Prompt and returns 200', async () => {
    const { id } = db.createPrompt('To delete', 'Content', ['tag']);

    const response = await DELETE(makeRequest(id));

    expect(response.status).toBe(200);
    expect(db.getPrompts()).toHaveLength(0);
  });

  it('returns 404 for a non-existent Prompt id', async () => {
    const response = await DELETE(makeRequest(999));
    expect(response.status).toBe(404);
  });

  it('redirects to /login when unauthenticated', async () => {
    const response = await DELETE(makeRequest(1, false));
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/login');
  });
});
