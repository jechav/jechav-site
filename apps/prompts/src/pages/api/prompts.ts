import type { APIRoute } from 'astro';
import type { createAuth } from '../../lib/auth';
import type { createDB } from '../../lib/db';

function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  return match ? match[1] : null;
}

export function requireAuth(
  request: Request,
  auth: ReturnType<typeof createAuth>,
): Response | null {
  const token = getSessionToken(request);
  if (!token || !auth.isValidToken(token)) {
    return new Response(null, { status: 302, headers: { location: '/login' } });
  }
  return null;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const auth = locals.auth as ReturnType<typeof createAuth>;
  const db   = locals.db  as ReturnType<typeof createDB>;

  const denied = requireAuth(request, auth);
  if (denied) return denied;

  const data    = await request.formData();
  const title   = data.get('title')?.toString().trim()   ?? '';
  const content = data.get('content')?.toString() ?? '';
  const tags    = data.get('tags')?.toString().split(',').map((t) => t.trim()).filter(Boolean) ?? [];

  if (!title) {
    return new Response('Title is required', { status: 400 });
  }

  const prompt = db.createPrompt(title, content, tags);
  return new Response(JSON.stringify(prompt), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
};
