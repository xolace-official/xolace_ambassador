# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repository.

**Read [`AGENTS.md`](./AGENTS.md) first — it is the source of truth** for the
stack, colour tokens, routing rules, form conventions, and the security rules
(Convex identity/authorization). This file only covers workflow that is not in
that document.

## Project

Xolace Ambassadors — the web portal and recruitment site for the Xolace Inc
Ambassadors Program.

- **Public site** — landing page and `/ambassadors` showcase. Mostly complete.
- **Portal** — authenticated, role-based dashboards under
  `src/app/(protected)/{admin,ambassador}/[uuid]/…`. Scaffolding; most feature
  pages are still placeholders.

## Commands

```bash
bun dev            # dev server (localhost:3000)
bun run build      # production build, also type-checks
bun run lint       # biome check
bun run format     # biome format --write
npx convex dev     # push convex functions to the dev deployment
```

## Conventions

- Path alias: `@/*` → `./src/*`
- Route groups: `(public)`, `(auth)`, `(protected)` — they do not affect the URL
- Feature components live in `src/features/<group>/<area>/<feature>/`, with
  `pages/` and `components/` subfolders. Route files in `src/app` stay thin and
  delegate to them.
- Biome, not ESLint. There is no test framework configured yet.
- Package manager is Bun.

## Gotchas

- `CLAUDE.md` previously described a Supabase backend. That migration is done —
  the backend is Convex. Do not reintroduce Supabase.
- Ambassador images are still hosted in a Supabase storage bucket. Treat that as
  legacy; new uploads should go to Convex file storage.
- The `[uuid]` route segment is the Convex user document id, **not** the `uuid`
  column on the `users` table. `uuid` is currently provisioned but unused.
