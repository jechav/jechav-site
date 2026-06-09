import type { APIRoute } from 'astro';
import type { createAuth } from '../../lib/auth';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const auth = locals.auth as ReturnType<typeof createAuth>;
  const data = await request.formData();
  const password = data.get('password')?.toString() ?? '';

  if (!auth.isValidPassword(password)) {
    return new Response(null, {
      status: 302,
      headers: { location: '/login?error=1' },
    });
  }

  const token = auth.sessionToken();
  const cookie = `session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000`;

  return new Response(null, {
    status: 302,
    headers: {
      'set-cookie': cookie,
      location: '/',
    },
  });
};
