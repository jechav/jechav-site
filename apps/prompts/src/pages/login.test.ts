import { describe, it, expect } from 'vitest';
import { createAuth } from '../lib/auth';
import { POST } from './api/login';

const TEST_PASSWORD = 'test-password';
const auth = createAuth(TEST_PASSWORD);

function makeLoginRequest(password: string) {
  const body = new URLSearchParams({ password });
  return new Request('http://localhost/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
}

describe('POST /api/login', () => {
  it('sets a session cookie when the password is correct', async () => {
    const response = await POST({
      request: makeLoginRequest(TEST_PASSWORD),
      locals: { auth },
      redirect: (url: string) => new Response(null, { status: 302, headers: { location: url } }),
    } as any);

    const cookie = response.headers.get('set-cookie') ?? '';
    expect(cookie).toContain('session=');
    expect(cookie).toContain(auth.sessionToken());
  });

  it('does not set a session cookie when the password is wrong', async () => {
    const response = await POST({
      request: makeLoginRequest('wrong-password'),
      locals: { auth },
      redirect: (url: string) => new Response(null, { status: 302, headers: { location: url } }),
    } as any);

    const cookie = response.headers.get('set-cookie') ?? '';
    expect(cookie).not.toContain('session=');
  });
});
