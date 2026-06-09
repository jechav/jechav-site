import type { APIRoute } from 'astro';

export const POST: APIRoute = () => {
  return new Response(null, {
    status: 302,
    headers: {
      'set-cookie': 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',
      location: '/',
    },
  });
};
