# Xolace Ambassadors — Agent & Engineering Standards

Read this before writing code. It is the source of truth for conventions,
security rules and the review bar. When something here conflicts with a
tutorial or a model memory, **this file wins**.

---

## 0. How to work

### Read the docs before deciding

Do not guess an API. Check the real docs for the installed version first —
APIs move and model memory is stale more often than not.

| Question | Where |
|---|---|
| Anything in `convex/` | `convex/_generated/ai/guidelines.md` (read it first, always) |
| Convex components / new capability | the `convex` skill |
| Next 16 file conventions, `proxy`, metadata | nextjs.org/docs |
| `nuqs` parsers, options, adapters | nuqs.dev/docs |
| UI / a11y review | the `web-design-guidelines` skill |

Then confirm against `node_modules` types when the docs and the installed
version might disagree. Check `package.json` for what is actually installed
before using a library feature.

### Don't over-engineer

The most common failure here is building for a future that has not arrived.

- Solve the problem in front of you. Not the three hypothetical ones.
- No abstraction layer until there are **three** real call sites.
- No new dependency to avoid writing twenty lines.
- No config option nobody has set.
- No wrapper around a library that adds nothing but indirection.
- Delete dead code and commented-out code. Git remembers it; you will not.

Prefer the boring solution that obviously works over the clever one. "Standard"
beats "optimal" almost every time in a codebase someone else maintains.

---

## 1. Stack (do not substitute)

| Concern | Library | Notes |
|---|---|---|
| Framework | Next.js 16 App Router, React 19 | `src/app` |
| Backend / BaaS | **Convex** | `convex/`. There is no Supabase. |
| Auth | `@convex-dev/auth` (password provider) | see §6 |
| UI primitives | shadcn/ui (new-york) | `src/components/ui` |
| Icons | `lucide-react` | never hand-roll an icon |
| Validation | `zod` | schemas at the boundary, see §5 |
| Forms | `react-hook-form` + `@hookform/resolvers` | see §5 |
| URL state | `nuqs` | see §4 |
| Request interception | `proxy.ts` (Next 16 renamed this from `middleware`) | see §9 |
| Animation | `motion` | |
| Styling | Tailwind v4 + CSS variables | see §3 |
| Lint/format | Biome | `bun run lint` / `bun run format` |

**Supabase is gone.** Do not reintroduce it, do not add `@supabase/*`, do not
add `SUPABASE_*` env vars. Ambassador photos are still served from an old
Supabase storage bucket as a *static file host only* — see
`LEGACY_IMAGE_BASE` in `src/constants/index.ts`. Migrate those to Convex file
storage and delete the constant.

State management: server state lives in Convex via `useQuery` / `useMutation`.
There is no Redux/Zustand/Jotai. URL state uses `nuqs`. Everything else is local
`useState`. Do not add a client state library.

---

## 2. Commands

```bash
bun dev             # dev server
bun run build       # production build (also type-checks)
bun run start       # serve the production build
bun run typecheck   # tsc --noEmit
bun run lint        # biome check
bun run lint:fix    # biome check --write
bun run format      # biome format --write
bun run check       # typecheck + lint — run before you call anything done

bun run convex:dev      # push + watch convex functions
bun run convex:push     # push once
bun run convex:codegen  # regenerate convex/_generated
bun run convex:data     # browse tables
bun run convex:logs     # tail function logs
bun run seed            # create/grant a portal user (see §6)
```

`bun run check` passing is the minimum bar. A change that does not type-check is
not finished.

---

## 3. Colors — hard rule

**No color literals outside `src/app/globals.css`.** That includes hex,
`oklch()`, `rgb()`, Tailwind palette classes (`text-rose-500`,
`bg-emerald-400`, `text-white`), and arbitrary color values
(`bg-[oklch(...)]`).

Allowed: `bg-background`, `text-foreground`, `border-border`,
`text-muted-foreground`, `bg-primary`, `ring-primary`, `bg-destructive`,
`text-success`, `bg-warning`, `bg-surface-inverse`,
`text-surface-inverse-foreground`, `fill="var(--brand-github)"`, and opacity
modifiers on any of them (`bg-primary/10`).

Need a new color? Add a **semantic** token to `:root` **and** `.dark`, map it in
`@theme inline` as `--color-<name>`, then use `<name>`. Name by role, never by
appearance: `--success`, not `--green-500`. That is what makes a palette change a
one-line edit.

Currently defined: `background`, `foreground`, `card`, `popover`, `primary`,
`secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`,
`chart-1..5`, `sidebar-*`, `dashboard-background`, `surface-inverse`, `success`,
`warning`, `brand-*`.

### Repeatable values

Anything used in more than one place belongs in `globals.css`:

- **Colors** → CSS variables (above)
- **Motion** → the global `prefers-reduced-motion` block already neutralises
  every animation. Do not add per-component handling unless you animate
  something CSS cannot reach (e.g. a canvas loop).
- **Z-index** → `--z-header`, `--z-overlay`, `--z-modal`, `--z-toast`. Use
  `z-modal`, never `z-[51]`.
- **Radii** → `--radius-*` via `rounded-*`
- **Shadows / glows** → `--shadow-color-*`

---

## 4. Routing & URL state — hard rule

### Routes are real files

```
src/app/(protected)/admin/[uuid]/missions/[missionId]/page.tsx
src/app/(protected)/ambassador/[uuid]/missions/completed/page.tsx
```

- **Never** a dynamic `[feature]` segment that switches on a string. One folder
  per feature, so each can have its own layout, data fetching and children.
- `role` is a **static** segment (`admin/` or `ambassador/`). It must never come
  from a URL parameter — a static segment cannot be spoofed.
- `[uuid]` is the signed-in user's own id. Still user-controlled, so the guard
  verifies it against the session on every render.
- **Every** `page.tsx` exports `metadata` via `portalMetadata()` from
  `@/lib/metadata`. Param-dependent pages use `generateMetadata`.
- Portal pages set `robots: { index: false, follow: false }` (done in the role
  layout). Never index an authenticated surface.

### Route vs modal — pick deliberately

| Use a **route** when | Use a **modal** when |
|---|---|
| It has content someone could bookmark | It is an action with no "after" |
| It deserves its own `metadata` | A refresh should discard it, not restore it |
| Someone will link to it directly | There is nothing to deep-link to |

Inviting someone is an action → modal, no route. Settings and Help are
destinations → routes.

### State that belongs in the URL

Anything a user might share, bookmark, or survive a refresh: filters, tabs,
pagination, sort, search, multi-step wizard position, expanded panels.

```tsx
const [category, setCategory] = useQueryState(
  "category",
  parseAsStringLiteral(["creator", "community"]),
);
```

- Use a **typed parser** so a hand-edited URL cannot produce an invalid value.
  For custom values use `createParser` and clamp on parse.
- `setX(null)` removes the key. Prefer that over empty strings.
- `NuqsAdapter` is already mounted at the root (`nuqs/adapters/next/app`).
- A component using `useQueryState` inside a **statically rendered** page must
  sit behind a `<Suspense>` boundary, or the build fails with
  `useSearchParams() should be wrapped in a suspense boundary`.
- Never put secrets, tokens or PII in a query string.

Keep in `useState`: transient drafts (an unsubmitted answer), open/closed
overlay state, ephemeral animation flags.

---

## 5. Forms & validation — hard rule

- `react-hook-form` + `zodResolver` for every form.
- Schema is `z.object({...})`, typed with `z.infer`. Schema field names **are**
  the form field names — no remapping layer.
- `z.email()`, not `z.string().email()` (zod v4).
- Error messages say how to fix it: "Enter a valid email address", not
  "Invalid input".
- Inputs need a `<label>` (via `htmlFor`), correct `type`, `autoComplete`,
  `spellCheck={false}` on emails/codes, and a placeholder ending in `…`.
- Never `onPaste` + `preventDefault`. Never block paste.
- Disable the submit button only while the request is in flight.
- Async feedback goes through `sonner` (`toast.success` / `toast.error`).
- Zod lives at the boundary. Convex mutations **also** validate with `v.*`
  validators — never trust a client schema as the only check.

---

## 6. Security — hard rule

### Identity and authorization

- **Identity always comes from the token.** `ctx.auth.getUserIdentity()` /
  `auth.getUserId(ctx)`. NEVER accept a `userId`, `role` or `ownerId` as a
  function argument for authorization — a client-supplied id is an assertion,
  not proof.
- Use the helpers in `convex/model/auth.ts`. Do not fork parallel ones:

  | Helper | Use for |
  |---|---|
  | `getSessionUser(ctx)` | "who am I" probe. Returns `null` when signed out. **Must not throw.** |
  | `requireUser(ctx)` | any data access; 401s anonymous callers |
  | `requireRole(ctx)` | portal data; 401/403s |
  | `requireAdmin(ctx)` | every cross-ambassador read/write |
  | `requireOwned(ctx, id, ownerField)` | any read/mutate keyed by an `_id` arg |

- `getSessionUser` returns `null` rather than throwing **on purpose**: the client
  calls it on every page including while signed out, and a thrown Convex query
  surfaces as a client-side render exception, not a value. Data functions throw.

### Rules that are not negotiable

1. **Internal by default.** Anything privileged — role assignment, account
   creation, anything an admin triggers — is `internalMutation` /
   `internalAction` / `internalQuery`. Internal functions are not in the public
   API at all. Verify with `npx convex run <fn>` from a plain client: it must
   return `Could not find public function`.
2. **Ownership on every id.** Reading or mutating a row by an `_id` argument
   requires `requireOwned` (or an inline equivalent). Being logged in is not
   owning the row.
3. **404, not 403, on ownership failure.** A 403 confirms the id exists, which
   leaks whether other ambassadors exist.
4. **Schema is the allowlist.** `role` is
   `v.optional(v.union(v.literal("admin"), v.literal("ambassador")))`. Never widen
   to `v.string()`.
5. **Fields added to the `users` table must be `v.optional`.** Convex Auth
   inserts that row itself; a required custom field breaks every sign-up.
6. **Never put PII, tokens or form data in a URL.** Query strings are logged.
7. **No `middleware.ts`.** See §9 for why `proxy` cannot authenticate here.
8. **No secrets in the client bundle.** `NEXT_PUBLIC_*` is public. If a secret
   ever needs a `NEXT_PUBLIC_` prefix to work, the design is wrong.

### Provisioning a user

`assignRole` and `createUser` are internal, so there is no seed script — that
is the point. Create the first account from the Convex dashboard:

```
admin:createUser  { "email": "...", "password": "...", "role": "admin" }
```

### Verifying a security change

Do not trust a passing type-check. Prove it against the deployment:

```js
import { ConvexHttpClient } from "convex/browser";
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
// privileged fn  -> "Could not find public function"
// anonymous data  -> "Uncaught AuthError: Unauthenticated"
```

Also test in a real browser: sign out, hit a protected URL, confirm redirect to
`/login` and that no shell renders. A CLI test alone misses client-side render
crashes — a thrown Convex query looks like a caught exception from the CLI but
hard-crashes the page in React.

---

## 7. Code style

- Biome, 2-space indent. Run `bun run format` before finishing.
- **Comments explain *why*, not *what*. One line, `//`.**
  - Bad: `// increment the counter`, `// render the header`
  - Bad: a JSDoc block that restates what the function does
  - Good: `// Clamp on parse so a hand-edited url can't index past the array`
  - Write a comment only when the code would otherwise look wrong, or be
    "corrected" by the next person, without it — a decision whose *reason* is
    invisible in the code.
  - Default to **no comment**. The code says what it does; only you know why.
  - No commented-out code. Delete it — git remembers it, you will not.
- No `any`. No non-null `!`. No `@ts-ignore`. Narrow with a type guard instead of
  suppressing. If a type is genuinely hard, reconsider the design.
- Prefer `const`. Never `var`. Early returns over nesting.
- Server components by default. `"use client"` only for interactivity — hooks,
  event handlers, browser APIs. Every client component is bundle cost, and a
  client component that renders `useQueryState` also forces a `<Suspense>`
  boundary (§4).
- Named exports for shared modules; default export for route `page.tsx` and
  single-component feature files.
- Kebab-case filenames, PascalCase components.

---

## 8. Accessibility — hard rule

Not a checklist to do at the end. Build it in.

- Semantic elements first: `<button>` for actions, `<Link>`/`<a>` for
  navigation. Never `<div onClick>`.
- Icon-only buttons need `aria-label`. Decorative icons need `aria-hidden`.
- Every interactive element has a visible `:focus-visible` ring. Never
  `outline-none` without a replacement.
- Every form control has a `<label>`. Errors appear next to the field and are
  associated with it.
- Async status and validation need `aria-live="polite"`.
- One `<h1>` per page, headings hierarchical, no level skipped.
- A skip link to main content on pages with a large nav.
- `…` not `...`. Curly quotes in prose. Loading states end in `…`.
- Dates/numbers via `Intl.DateTimeFormat` / `Intl.NumberFormat`, with an
  explicit `timeZone` when rendering on both server and client.
- Never `user-scalable=no`. Never disable zoom.
- `touch-action: manipulation` on interactive elements; modals get
  `overscroll-behavior: contain`.

---

## 9. `proxy.ts` — and why it is not the security boundary

Next 16 renamed `middleware` to `proxy`; `middleware` is deprecated. The file is
`src/proxy.ts`, exporting a function named `proxy`, with a `config.matcher`.

Next's own guidance is to avoid it where possible — it is a last resort. Ours
does exactly one job: **response security headers**.

It deliberately does **not** authenticate. Convex Auth keeps its token in
localStorage, so there is no cookie for a proxy to verify. Any "check" written
against a header or a client-readable value is trivially bypassed, and shipping
one would create a false sense of safety. Authorization lives in the Convex
functions, which see a signature the client cannot forge.

The client-side `ProtectedRouteGuard` is UX (prevents a wrong-dashboard flash),
not security.

---

## 10. SEO

- **Every** page exports `metadata`. Portal pages use `portalMetadata()`; the
  role layout supplies the `title.template`.
- Public pages need a real `title` and `description`. One `<h1>` that describes
  the page.
- Authenticated and per-user routes are `noindex, nofollow` — set in the role
  layouts, and disallowed in `src/app/robots.ts`.
- `src/app/sitemap.ts` lists only public, indexable routes. Add a route there
  when you add a public one.
- Semantic HTML and real text beat meta keywords. Do not add keywords.
- Images: descriptive `alt` (or `alt=""` if decorative), explicit dimensions
  via `next/image` `fill` + `sizes` or `width`/`height`, `priority` for
  above-the-fold hero images only.
- `lang` is set on `<html>`. Brand names and code tokens get
  `translate="no"`.

---

## 11. Responsive design

- Mobile-first. Base styles are the small screen; add breakpoints upward.
- Test at 360px, 768px, 1280px. A layout that only works at 1440px is broken.
- No horizontal scroll at any width. Long words and URLs need `break-words` or
  `truncate`.
- Tap targets ≥ 44px. Flex children that hold text need `min-w-0` to truncate.
- `env(safe-area-inset-*)` on fixed bottom bars and full-bleed headers.
- Prefer CSS grid/flex over JS measurement. Never read layout in render
  (`getBoundingClientRect`, `offsetHeight`, `scrollTop`).
- Lists over ~50 items: paginate or virtualise.

---

## 12. Component reusability

- Search before you write. `src/components/ui` and `src/features` already hold
  most of what a new screen needs.
- A UI primitive goes in `src/components/ui` only when it is genuinely generic.
  Feature-specific pieces stay in `src/features/<group>/<area>/<feature>/components`.
- Before extracting a shared component, there must be **three** real call sites.
  Two similar blocks are not a pattern yet.
- Extract when the *behaviour or markup* is duplicated, not just the styling —
  that is what `cn()` and CSS variables are for.
- Components own their data fetching unless a parent explicitly passes it down.
  Do not build a context/provider layer for state that two components read.
- Props should be few and typed. A component needing eight props usually wants
  to be two components.

---

## 13. Scalability

- **Server state lives in Convex.** One query per view; do not fetch a list to
  count it. Use `.withIndex()` and return bounded results — `.take(n)` or
  paginate, never unbounded `.collect()` on a table that grows.
- Do not store unbounded arrays inside a document. Child rows get their own
  table with a foreign key.
- Separate high-churn columns (lastSeen, counters) from stable profile data, or
  every write contends with every read of the row.
- Push filtering, sorting and pagination to the database. Never filter a full
  list in the client.
- Debounce search input. Virtualise long lists.
- Index any field you query by. Indexes on large tables should be declared
  `staged: true` so a backfill does not block deploys.
- Client components cost bundle size — keep `"use client"` as low in the tree
  as possible.
- For background work use Convex scheduling or `@convex-dev/workpool`, not a
  hand-rolled retry loop.

---

## 14. Review bar

Before declaring work done:

- [ ] `bun run check` clean (typecheck + lint)
- [ ] `bun run build` passes
- [ ] New page exports `metadata`; public routes added to `sitemap.ts`
- [ ] No color literal outside `globals.css`
- [ ] New filter/tab/wizard state is in the URL via `nuqs`
- [ ] Every new privileged Convex function is `internal*`
- [ ] Every id-keyed read/write has an ownership check
- [ ] Anonymous browser access to a protected route redirects to `/login`
- [ ] Keyboard reachable, labelled, and visible focus on anything interactive
- [ ] Works at 360px without horizontal scroll
- [ ] Checked an existing component before writing a new one
- [ ] No unnecessary comments, no dead code, no speculative abstraction
