# jechav-site

A personal website with blog and other subprojects.

## Project Structure

This is a **monorepo** using npm workspaces with multiple applications:

- **Root**: Next.js 16 app serving the main site at `jechav.me`
  - Includes blog posts using MDX + gray-matter for frontmatter
  - Styled with Tailwind CSS v4
  
- **`apps/prompts`**: Astro 6 SSR app at `prompts.jechav.me`
  - Standalone Node.js adapter for server-side rendering
  - SQLite database for persistent data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework (Root) | Next.js 16.1.1 with App Router |
| Framework (Subapps) | Astro 6.4.5 |
| React | v19.2.3 |
| Styling | Tailwind CSS v4 |
| Content | MDX, gray-matter (frontmatter), rehype-pretty-code |
| Database | SQLite (prompts app) |
| Runtime | Node.js 24+ |

## Development

### Setup

```bash
npm install
```

### Running Locally

**Root Next.js app** (localhost:3000):
```bash
npm run dev
```

**Specific workspace** (e.g., prompts at localhost:4321):
```bash
npm run dev -w @jechav/prompts
```

### Building

Build root app:
```bash
npm run build
```

Build specific workspace:
```bash
npm run build -w @jechav/prompts
```

## Deployment

### Local Docker Testing

Build and run all services locally using docker-compose:

```bash
docker compose up --build
```

- Next.js app: http://localhost:3002
- Prompts app: http://localhost:4321

### Production Deployment (DigitalOcean)

**One-time setup:**
1. Clone repo on droplet (e.g. `/srv/jechav-site`)
2. Create `apps/prompts/.env` from `.env.example`, set `AUTH_PASSWORD` and `DATABASE_PATH=/app/data/prompts.db`
3. Merge Caddy blocks from `deploy/Caddyfile.snippet` into server Caddyfile
4. Ensure the droplet user can `git pull` via SSH (deploy key on server, e.g. `~/.ssh/jechav-site-deploy`)
5. Set GitHub secrets: `DROPLET_HOST`, `DROPLET_USER`, `SSH_PRIVATE_KEY`, `REPO_PATH`, `PATH_SSH_GH_KEY`
   - `PATH_SSH_GH_KEY` should be the absolute path to the GitHub deploy key file on the droplet (for example, `/home/deploy/.ssh/jechav-site-deploy`)

**Automatic deployment:**
- Push to `main` branch → GitHub Actions workflow triggers
- Workflow SSH's into droplet, pulls latest code, runs `docker compose up --build -d`

### Adding New Subapps

1. Create app in `apps/myapp/` with `package.json` and `Dockerfile`
2. Add service to `docker-compose.yml` with new port
3. Add Caddyfile block in `deploy/Caddyfile.snippet` for the subdomain
4. Merge into `main` — deployment is automatic

## Scripts

```bash
npm run dev      # Start root Next.js dev server
npm run build    # Build root app for production
npm run start    # Start root app in production mode
npm run lint     # Run ESLint
```

See `package.json` for full workspace scripts.
