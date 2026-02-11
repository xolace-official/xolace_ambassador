# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Xolace Ambassador Program website — a Next.js 16 app for recruiting and showcasing Xolace ambassadors. Built with React 19, TypeScript, Tailwind CSS v4, and Supabase as the backend.

## Commands

```bash
bun dev          # Start dev server (localhost:3000)
bun run build    # Production build
bun run lint     # Lint & format check (Biome)
bun run format   # Auto-format code (Biome)
```

Package manager is **Bun** (bun.lock present). No test framework is configured.

## Architecture

**Next.js App Router** with the `src/` directory structure:

- `src/app/` — Routes and layouts (App Router file-based routing)
  - `(pages)/` — Route group for page routes (e.g., `/ambassadors`)
- `src/components/` — React components organized by feature
  - `ambassador/` — Feature components (hero, benefits, join form, program details, footer)
  - `layout/` — Layout components (navbar)
  - `(pages)/` — Page-level composite components
  - `ui/` — Reusable shadcn/ui primitives (Button, Card, Input, Sonner)
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/utils/supabase/client.ts` — Browser-side Supabase client

**Routes**: `/` (landing page), `/ambassadors` (ambassador showcase)

## Tech Stack & Patterns

- **Styling**: Tailwind CSS v4 with OkLCH color system, light/dark theme via CSS custom properties and `next-themes`. Fonts: Nunito (sans), PT Sans (serif).
- **Components**: shadcn/ui (new-york style) with CVA for variants. Add new components via `npx shadcn@latest add <component>`.
- **Animation**: Motion library (Framer Motion) — uses `whileInView` for scroll-triggered animations with stagger effects.
- **Backend**: Supabase (browser client via `getSupabaseBrowserClient()`). Database table: `ambassadors` (name, email).
- **Linting**: Biome (not ESLint) — 2-space indent, recommended rules + React/Next.js domains, auto-organized imports.
- **React Compiler**: Enabled in `next.config.ts`.
- **Images**: Remote patterns configured for `images.unsplash.com`.

## Key Conventions

- Path alias: `@/*` maps to `./src/*`
- File naming: kebab-case for files, PascalCase for components
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
