# SQLite on a Node.js server for Prompt Library persistence

The Prompt Library is a single-owner personal tool with low write volume and no need for horizontal scaling. We chose SQLite (file-based, zero infrastructure cost) over a hosted Postgres service. This requires deployment to a persistent Node.js server (Railway, Fly.io, Render, or a VPS) rather than a serverless platform — SQLite's file cannot be shared across serverless function instances.

## Considered Options

- **Postgres on Supabase/Neon** — operational overhead and cost for a personal tool; ruled out.
- **Serverless + SQLite via Turso** — introduced vendor lock-in with no benefit at this scale; ruled out.
