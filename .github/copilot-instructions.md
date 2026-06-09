# GitHub Copilot Instructions for jechav-site

## Project Overview
This is a modern Next.js 16.1.1 project using the App Router, React 19, TypeScript, and Tailwind CSS v4. The site uses Geist font family (sans and mono variants) with dark mode support.

## Tech Stack
- **Framework**: Next.js 16.1.1 with App Router architecture
- **React**: v19.2.3 (latest with JSX transform in tsconfig)
- **Styling**: Tailwind CSS v4 with PostCSS plugin (`@tailwindcss/postcss`)
- **Content**: MDX with `next-mdx-remote`, `gray-matter` for frontmatter, `rehype-pretty-code` for syntax highlighting
- **TypeScript**: Strict mode enabled, path alias `@/*` maps to project root
- **Node**: Requires >=24.11.0 (see `package.json` engines field)
- **Font**: Geist Sans and Geist Mono from `next/font/google`

## Architecture & File Structure
- **`src/app/`**: Next.js App Router directory containing all routes and layouts
  - `layout.tsx`: Root layout with font configuration and metadata
  - `page.tsx`: Homepage component
  - `globals.css`: Global styles with Tailwind imports and CSS variables
  - `blog/`: Blog listing and dynamic post routes
    - `page.tsx`: Blog index showing all posts
    - `[slug]/page.tsx`: Individual blog post renderer with MDX compilation
- **`src/content/posts/`**: MDX blog posts with frontmatter (title, date, description)
- **`src/lib/posts.ts`**: Server-side utilities for reading/parsing blog posts from filesystem
- **`src/mdx-components.tsx`**: Custom MDX component mappings for styled rendering
- **`public/`**: Static assets served from root path
- **Path aliases**: Use `@/` to import from project root (configured in tsconfig.json)

## Styling Conventions
- **Tailwind v4 syntax**: Use `@import "tailwindcss"` (not v3's `@tailwind` directives)
- **CSS Variables**: Define theme tokens in `globals.css` using `@theme inline` directive
  - Custom colors: `--color-background`, `--color-foreground` 
  - Custom fonts: `--font-sans`, `--font-mono` reference Next.js font variables
- **Dark mode**: Implemented via CSS media query `prefers-color-scheme: dark`
- **Responsive design**: Mobile-first with `sm:` breakpoint for small screens and up
- **Class patterns**: Use utility-first Tailwind classes, combining flexbox layouts with semantic spacing

## Component Patterns
- **Server Components by default**: All components in `src/app/` are React Server Components unless marked with `"use client"`
- **Image optimization**: Always use `next/image` component (see [src/app/page.tsx](src/app/page.tsx) for examples)
- **Font loading**: Configure fonts in root layout using `next/font/google` with CSS variables
- **Metadata**: Export `metadata` object from layouts/pages (see [src/app/layout.tsx](src/app/layout.tsx))
  - For dynamic routes, use `generateMetadata` async function (see [src/app/blog/[slug]/page.tsx](src/app/blog/[slug]/page.tsx))

## MDX & Blog Patterns
- **Content structure**: Blog posts live in `src/content/posts/` as `.mdx` files with YAML frontmatter
  - Required frontmatter: `title` (string), `date` (ISO string)
  - Optional: `description` for SEO and previews
- **MDX compilation**: Use `next-mdx-remote/rsc` with `compileMDX` for server-side rendering
  - Syntax highlighting via `rehype-pretty-code` with `github-dark` theme
  - Custom components defined in [src/mdx-components.tsx](src/mdx-components.tsx)
- **Post utilities**: [src/lib/posts.ts](src/lib/posts.ts) provides filesystem-based post management
  - `getAllPosts()`: Returns all posts sorted by date (newest first)
  - `getPostBySlug(slug)`: Reads and parses single post with `gray-matter`
  - Posts directory: `src/content/posts/` (hardcoded path)
- **Dynamic routes**: Use async `params` prop (Next.js 15+ pattern) - see `[slug]/page.tsx`

## Development Workflow
- **Dev server**: `npm run dev` (starts on localhost:3000)
- **Build**: `npm run build` (required before production deployment)
- **Linting**: `npm run lint` (uses ESLint 9 flat config with Next.js presets)
- **Type checking**: TypeScript in strict mode; tsconfig includes Next.js plugin
- **Content authoring**: Add `.mdx` files to `src/content/posts/` with frontmatter; no rebuild needed for dev

## Configuration Files
- **`eslint.config.mjs`**: Uses ESLint 9 flat config format with `defineConfig` and Next.js core-web-vitals preset
- **`next.config.ts`**: TypeScript-based Next.js config (currently minimal)
- **`postcss.config.mjs`**: Only includes `@tailwindcss/postcss` plugin for Tailwind v4

## Key Conventions
- **File extensions**: Use `.tsx` for React components, `.ts` for utilities, `.mjs` for config files
- **TypeScript target**: ES2017 with modern ESNext modules
- **Strict typing**: `strict: true` in tsconfig, prefer explicit types for props and returns
- **Import order**: Standard practice is React imports first, then Next.js, then local components

## External Links & Resources
- Components often include UTM parameters for tracking (see src/app/page.tsx Vercel/learning links)
- External links should use `target="_blank"` and `rel="noopener noreferrer"` for security
