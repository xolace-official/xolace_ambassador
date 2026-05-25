# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server (http://localhost:3000)
bun build        # Production build
bun start        # Start production server
bun lint         # Biome lint check
bun format       # Biome format (writes files)
```

> This project uses **bun** as the package manager. Do not use npm/yarn/pnpm.

## Environment Variables

Copy `.env` and populate:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` — Supabase anon/publishable key

## Architecture

Single-purpose Next.js 16 App Router site for the Xolace Ambassador Program — a landing page for ambassador sign-ups and a listing of existing ambassadors.

### Page structure

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing page assembling ambassador section components |
| `/ambassadors` | `src/app/(pages)/ambassadors/page.tsx` | Renders the full-page `Ambassadors` component |

The root layout (`src/app/layout.tsx`) wraps all pages with `NavBar`, `Footer`, and Vercel `Analytics`.

### Component organization

- `src/components/ambassador/` — Section-level components for the landing page: `HeroSection`, `JoinProgramForm`, `ProgramDetails`, `Benefits`, `Footer`
- `src/components/layout/` — `NavBar` (sticky, animated, mobile-responsive with drawer), `XolaceLogo`
- `src/components/(pages)/ambassadors.tsx` — Self-contained page component for the ambassadors listing (currently uses hardcoded sample data)
- `src/components/ui/` — shadcn/ui primitives (new-york style, Tailwind CSS v4, `cn()` from `@/lib/utils`)

### Data layer

Only a browser Supabase client exists (`src/utils/supabase/client.ts` → `getSupabaseBrowserClient()`). There is no server-side data fetching yet. Form submissions in `JoinProgramForm` insert directly into the `ambassadors` table (`name`, `email` columns).

### Styling

- Tailwind CSS v4 with CSS variables for theming (defined in `src/app/globals.css`)
- Light and dark themes supported via `.dark` class
- Primary color: pink/magenta (`oklch(0.6726 0.2904 341.4084)`)
- Fonts: Nunito (sans, body) and PT_Sans (loaded via `next/font/google`)

### Key constraints

- Remote images are only allowed from `images.unsplash.com` (configured in `next.config.ts`)
- The React Compiler is enabled (`reactCompiler: true`) — avoid manual `useMemo`/`useCallback` for render optimization
- Biome (not ESLint/Prettier) handles linting and formatting; 2-space indentation, auto import organization on save
- Navigation items for About and Contact routes are commented out in `NavBar` — those pages do not exist yet
