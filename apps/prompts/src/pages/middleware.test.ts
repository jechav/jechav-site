import { describe, it, expect } from 'vitest';
import { createAuth } from '../lib/auth';
import { POST as createPromptHandler } from './api/prompts';

const TEST_PASSWORD = 'test-password';
const auth = createAuth(TEST_PASSWORD);

function makeRequest(cookie?: string) {
  return new Request('http://localhost/api/prompts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(cookie ? { cookie } : {}),
    },
    body: new URLSearchParams({ title: 'Test', content: 'Hello', tags: 'writing' }).toString(),
  });
}

describe('protected route middleware', () => {
  it('redirects to /login when no session cookie is present', async () => {
    const response = await createPromptHandler({
      request: makeRequest(),
      locals: { auth },
      redirect: (url: string) => new Response(null, { status: 302, headers: { location: url } }),
    } as any);

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/login');
  });

  it('passes through when a valid session cookie is present', async () => {
    const validCookie = `session=${auth.sessionToken()}`;
    const response = await createPromptHandler({
      request: makeRequest(validCookie),
      locals: { auth, db: { createPrompt: () => ({ id: 1, title: 'Test', content: 'Hello', tags: ['writing'], createdAt: '' }) } },
      redirect: (url: string) => new Response(null, { status: 302, headers: { location: url } }),
    } as any);

    expect(response.status).not.toBe(302);
  });
});
