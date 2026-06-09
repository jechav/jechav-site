import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createAuth } from '../lib/auth';
import { createDB } from '../lib/db';
import { POST } from './api/prompts';

const TEST_PASSWORD = 'test-password';
const auth = createAuth(TEST_PASSWORD);

let dir: string;
let db: ReturnType<typeof createDB>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'prompts-create-test-'));
  db = createDB(join(dir, 'prompts.db'));
});

afterEach(() => {
  rmSync(dir, { recursive: true });
});

function makeRequest(fields: Record<string, string>, authenticated = true) {
  const cookie = authenticated ? `session=${auth.sessionToken()}` : '';
  return new Request('http://localhost/api/prompts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(cookie ? { cookie } : {}),
    },
    body: new URLSearchParams(fields).toString(),
  });
}

const ctx = (request: Request) => ({
  request,
  locals: { auth, db },
  redirect: (url: string) => new Response(null, { status: 302, headers: { location: url } }),
} as any);

describe('POST /api/prompts', () => {
  it('creates a Prompt and returns 201 with the Prompt data', async () => {
    const response = await POST(ctx(makeRequest({
      title: 'Debug helper',
      content: 'Explain this error and suggest a fix.',
      tags: 'coding,debugging',
    })));

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.title).toBe('Debug helper');
    expect(body.tags).toEqual(['coding', 'debugging']);
  });

  it('returns 400 when title is empty', async () => {
    const response = await POST(ctx(makeRequest({
      title: '',
      content: 'Some content',
      tags: '',
    })));

    expect(response.status).toBe(400);
  });
});
