import type { APIRoute } from 'astro';
import type { createAuth } from '../../lib/auth';
import type { createDB } from '../../lib/db';
import { requireAuth } from './prompts';

export const DELETE: APIRoute = ({ request, locals, params }) => {
  const auth = locals.auth as ReturnType<typeof createAuth>;
  const db   = locals.db  as ReturnType<typeof createDB>;

  const denied = requireAuth(request, auth);
  if (denied) return denied;

  const id = Number(params.id);
  const deleted = db.deletePrompt(id);
  if (!deleted) {
    return new Response('Prompt not found', { status: 404 });
  }

  return new Response(null, { status: 200 });
};

export const PUT: APIRoute = async ({ request, locals, params }) => {
  const auth = locals.auth as ReturnType<typeof createAuth>;
  const db   = locals.db  as ReturnType<typeof createDB>;

  const denied = requireAuth(request, auth);
  if (denied) return denied;

  const id      = Number(params.id);
  const data    = await request.formData();
  const title   = data.get('title')?.toString().trim()   ?? '';
  const content = data.get('content')?.toString() ?? '';
  const tags    = data.get('tags')?.toString().split(',').map((t) => t.trim()).filter(Boolean) ?? [];

  const prompt = db.updatePrompt(id, title, content, tags);
  if (!prompt) {
    return new Response('Prompt not found', { status: 404 });
  }

  return new Response(JSON.stringify(prompt), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
