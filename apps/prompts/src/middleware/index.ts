import { defineMiddleware } from 'astro:middleware';
import { createDB } from '../lib/db';
import { createAuth } from '../lib/auth';

const password = process.env.AUTH_PASSWORD;
if (!password) {
  throw new Error('AUTH_PASSWORD environment variable is required but not set.');
}

const dbPath = process.env.DATABASE_PATH ?? './prompts.db';

const db   = createDB(dbPath);
const auth = createAuth(password);

function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  return match ? match[1] : null;
}

export const onRequest = defineMiddleware((context, next) => {
  context.locals.db   = db;
  context.locals.auth = auth;

  const token = getSessionToken(context.request);
  context.locals.isAuthenticated = !!(token && auth.isValidToken(token));

  return next();
});
