import type { APIRoute } from 'astro';
import type { createAuth } from '../../../../lib/auth';
import type { createDB } from '../../../../lib/db';
import { requireAuth } from '../../prompts';

export const POST: APIRoute = ({ request, locals, params }) => {
  const auth = locals.auth as ReturnType<typeof createAuth>;
  const db   = locals.db  as ReturnType<typeof createDB>;

  const denied = requireAuth(request, auth);
  if (denied) return denied;

  const id = Number(params.id);
  const restored = db.restorePrompt(id);
  if (!restored) {
    return new Response('Prompt not found or not deleted', { status: 404 });
  }

  return new Response(null, { status: 200 });
};
