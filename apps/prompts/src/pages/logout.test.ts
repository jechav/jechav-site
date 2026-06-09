import { describe, it, expect } from 'vitest';
import { POST as logout } from './api/logout';

describe('POST /api/logout', () => {
  it('clears the session cookie', async () => {
    const response = await logout({
      request: new Request('http://localhost/api/logout', { method: 'POST' }),
      locals: {},
      redirect: (url: string) => new Response(null, { status: 302, headers: { location: url } }),
    } as any);

    const cookie = response.headers.get('set-cookie') ?? '';
    expect(cookie).toContain('session=');
    expect(cookie).toContain('Max-Age=0');
  });
});
