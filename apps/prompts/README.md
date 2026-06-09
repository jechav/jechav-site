# Prompt Library

Personal prompt management subsite for `prompts.jechav.dev`.

## Stack

- [Astro](https://astro.build) SSR with the Node.js adapter
- SQLite via `better-sqlite3` (FTS5 for full-text search)
- Single-password authentication via HMAC-signed session cookie
- [Vitest](https://vitest.dev) for tests

## Development

```bash
cp .env.example .env
# Edit .env and set AUTH_PASSWORD

npm install
npm run dev
```

## Environment variables

| Variable        | Required | Default        | Description                        |
|-----------------|----------|----------------|------------------------------------|
| `AUTH_PASSWORD` | ✅       | —              | Password to log in to the library  |
| `DATABASE_PATH` | No       | `./prompts.db` | Path to the SQLite database file   |

## Running tests

```bash
npm test
```

## Building for production

```bash
npm run build
# Output in dist/ — run with:
node dist/server/entry.mjs
```

## Deployment

Deploy to any **persistent Node.js server** (Railway, Fly.io, Render, VPS).
Do **not** deploy to serverless platforms (Vercel, Netlify) — SQLite requires
a persistent filesystem.

Set the two env vars above and point your DNS for `prompts.jechav.dev` at the
server. Use a reverse proxy (nginx, Caddy) to terminate TLS and forward to the
Node process.
