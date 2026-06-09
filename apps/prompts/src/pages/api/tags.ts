import type { APIRoute } from 'astro';
import type { createDB } from '../../lib/db';

export const GET: APIRoute = ({ url, locals }) => {
  const db = locals.db as ReturnType<typeof createDB>;
  const q  = url.searchParams.get('q') ?? undefined;
  const tags = db.getTags(q);
  return new Response(JSON.stringify(tags), {
    headers: { 'content-type': 'application/json' },
  });
};
