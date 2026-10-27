# Forma — User Management Dashboard with Custom Theming Engine

Forma is a MERN take-home build: a user management dashboard (CRUD + live
counts, all data in MongoDB) plus a self-built theming engine — four presets,
an action-accent override and a custom font upload, live on screen and persisted
in `localStorage`. No authentication, no third-party UI/theming library.

The product opens with a public, editorial landing page at `/`, then continues
into the product workspace at `/dashboard`. The workspace uses a compact
collapsible sidebar, a `Ctrl/Cmd+K` command palette, editorial page headings
and a restrained palette built from the same tokens the theme engine drives.
The presentation layer does not change the API contract, CRUD behaviour or
theme persistence.

- **Frontend:** React 19 + TypeScript (strict) + Vite, GSAP + Three.js for the dashboard motion layer
- **Backend:** Node.js + Express 5 (JavaScript, ESM), layered architecture
- **Database:** MongoDB via Mongoose
- **Package manager:** pnpm

## 1. Setup

Prerequisites: Node.js ≥ 20, pnpm ≥ 9 (`corepack enable pnpm`), and MongoDB
running locally **or** an Atlas connection string.

### Backend (port 5000)

```bash
cd server
pnpm install
cp .env.example .env    # then edit the values as needed
pnpm seed               # optional: wipes the collection and inserts 64 demo users
pnpm dev                # http://localhost:5000
```

`server/.env` keys (all required — the server **fails fast** at startup with a
clear message if something is missing or malformed):

| Variable        | Example                                      | Purpose                        |
| --------------- | -------------------------------------------- | ------------------------------ |
| `PORT`          | `5000`                                       | HTTP port                      |
| `MONGODB_URI`   | Local: `mongodb://127.0.0.1:27017/forma`     | Mongo connection string        |
| `MONGODB_URI`   | Atlas: `mongodb+srv://<user>:<pass>@<cluster>/forma?retryWrites=true&w=majority` | Cloud hosted DB |
| `CLIENT_ORIGIN` | `http://localhost:5173` (comma-separate for more) | Strict CORS allowlist     |
| `NODE_ENV`      | `development`                                | `development` \| `production` \| `test` |

### Frontend (port 5173)

```bash
cd client
pnpm install
pnpm dev                # http://localhost:5173
```

Optionally create `client/.env` (from `client/.env.example`) to set
`VITE_API_URL` when the API is not on `http://localhost:5000/api`.

### Vercel deployment

Set the Vercel project root directory to `client`. The included
`client/vercel.json` rewrites client-side routes such as `/dashboard`, `/users`
and `/settings` to the Vite entry document, so refreshing a nested route does
not return Vercel's 404 page.

---

## 2. API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint           | Purpose                                  | Notes |
| ------ | ------------------ | ---------------------------------------- | ----- |
| GET    | `/users`           | List — `page`, `limit`, `search`, `role`, `status`, `sort` | 200 |
| GET    | `/users/stats`     | Dashboard counters                        | 200 |
| GET    | `/users/:id`       | One user                                  | 400 / 404 |
| POST   | `/users`           | Create                                    | `201`, `400` validation, `409` duplicate email |
| PUT    | `/users/:id`       | Partial update                            | 200 / 400 / 404 / 409 |
| DELETE | `/users/:id`       | Delete                                    | 200, returns `{ data: { id } }` |
| GET    | `/health`          | API + database readiness                  | 200 |

**Response envelope.** Successes are `{ data: … }` (plus `pagination` on
lists). Failures are exactly:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Validation failed",
             "fields": { "phone": "Phone must contain between 7 and 15 digits" } } }
```

Machine codes: `VALIDATION_ERROR`, `DUPLICATE_EMAIL`, `INVALID_ID`,
`NOT_FOUND`, `PARSE_ERROR`, `DB_UNAVAILABLE`, `UNEXPECTED_ERROR`. Stack traces
are never sent to clients.

**Stats shape** (computed by a single aggregation over the whole collection —
no N+1 `countDocuments`): `{ "total", "active", "inactive", "last7Days" }`.

**Validation rules** (enforced client- and server-side): name 2–80 chars;
valid email, unique; role `admin | editor | viewer` (default `viewer`);
status `active | inactive` (default `active`); optional phone with 7–15
digits.

## 3. What was implemented

| Brief section | Status |
| ------------- | ------ |
| **A. Product basic views** — Landing page, Dashboard (live counts), Users list | Done — public landing page with header, hero, explanatory sections, CTA and footer; workspace dashboard has a compact metric strip with tabular numerals and a recent-user table opening a details drawer; counts refetch on mount and after every mutation |
| **B. User management CRUD** | Done — dedicated editor routes (`/users/new`, `/users/:id/edit`), details drawer from any row, contextual action menu (view/edit/delete), delete confirmation naming the user, focus landing on Cancel, Esc closes |
| **C. Validation (client + server)** | Done — inline errors on blur and submit, server field errors mapped back onto inputs (duplicate email lands under the email box) |
| **D. Theming engine** | Done — 4 presets (Light default / Blue / Violet / Dark), action-accent override with luminance-based text, custom font upload, live repaint, `localStorage` persistence |
| **E. Persistence + API contract** | Done — Mongo for users only, `localStorage` for theme only; `{ error: { code, message, fields } }` contract |
| **F. Interface redesign** | Done — collapsible 224px sidebar, command palette, URL-backed list state, appearance drawer, `/settings`, keyboard/focus handling, responsive down to 420px |
| **G. Dashboard landing experience** | Done — editorial hero, scroll-scrubbed Three.js signal scene and GSAP reveal/parallax choreography, all driven by the active theme accent |
| Stretch | Server-side search/filter/sort/pagination (debounced search, URL-synced state) |

### 3.1 Interface and interaction

- **Shell** — 224px sidebar (collapsible to a 64px icon rail on desktop, a
  slide-over drawer below 900px) and a 60px topbar. A skip link, landmarks and
  visible focus rings cover keyboard use.
- **Command palette** — `Ctrl/Cmd+K` (or the topbar search) searches real users
  through the API and lists page/action commands. Arrow keys move, Enter runs,
  Esc closes, focus is trapped and restored.
- **Landing page** — public `/` route with a header, hero CTA, three explanatory
  sections, theme preview, footer and a clear Continue to dashboard handoff.
- **Dashboard** — authenticated-style workspace route at `/dashboard` with an
  editorial heading, a compact total/active/new-this-week strip with one
  prioritized metric and tabular numerals, then recent users.
  Clicking a row opens the same details drawer used by the directory.
- **Users** — search, role/status filters, sorting, page size and page number
  are server-backed and mirrored into the URL. Each row has a compact action
  menu (view/edit/delete); Add User is the single primary action. The details
  drawer is driven by `?user=<id>`, so it is linkable and reload-safe.
- **Settings** — `/settings` holds the appearance controls inline and can also
  open the shared appearance drawer, which is reachable from the account menu
  and the palette.
- **Overlays** — dialogs and drawers trap focus, restore the opener, share a
  reference-counted scroll lock and close in layers (Esc closes the dialog
  before the drawer beneath it).
- **Responsive** — at ≤900px navigation moves into a drawer; at ≤760px filters
  stack and search goes full width; at ≤620px the topbar search becomes an
  icon; at ≤480px tables drop secondary columns to fit phones without
  horizontal page scroll.

### 3.1.1 Dashboard motion layer

The workspace dashboard and public landing page share the same visual language.
`LandingPage` owns the public header, hero, explanation sections and footer;
`SignalScene` owns a deliberately small Three.js
composition (wireframe core, rings and particles) rather than a decorative stock
illustration. GSAP and ScrollTrigger use the existing `.app__content` scroller,
so the hero responds to the workspace scroll rather than the browser window.
The scene reads the resolved action accent from the theme context, and all
motion is torn down with the component so route changes do not leak a renderer
or scroll trigger. The visual language stays editorial: thin rules, quiet
surfaces, small metadata labels and one accent instead of gradients, glassmorphism
or a collection of unrelated cards.

## 4. Theming architecture note

The active theme is always **derived, never stored as CSS**. State holds three
independent values — `presetId`, `buttonColor` (nullable) and `font`
(`{ fileName, dataUrl }` or null) — and a pure function turns that state into
CSS variables:

- `themes/presets.ts` — typed preset definitions only (Light, Blue, Violet,
  Dark). These are the only hex literals in `src/` plus their documented
  first-paint mirror in `index.html`. Each preset carries a full palette —
  background, sidebar, surfaces, text, muted text, borders, accent, status
  colors, overlay and shadows — so the shell, tables, forms and overlays all
  move together. Muted text is tuned per preset to keep WCAG AA contrast on
  both page and sidebar backgrounds, and the extra micro-label token
  (`--color-text-subtle`) plus hover/soft fills are derived with `color-mix()` —
  no additional hex literals.
- `themes/resolveTheme.ts` — pure `(state) => Record<string, string>`: the
  preset supplies the base tokens; a non-null `buttonColor` replaces **only**
  `--btn-bg` (and its hover companion) and recomputes `--btn-text` from the
  WCAG relative luminance of the chosen color — the crossover threshold 0.179
  always picks the highest-contrast text, so a yellow button gets near-black
  text while cobalt keeps white; a present `font` contributes `--font-family`
  with the system fallback stack.
- `themes/themeStorage.ts` — the only file that touches `localStorage` (or
  rather, ever could): one versioned key `app.theme.v1`, safe parse falling
  back to defaults on corrupt data, quota-aware writes.
- `themes/fontLoader.ts` — validates extension + MIME + size (1.5 MB raw)
  before reading, loads the font as an **ArrayBuffer** into
  `new FontFace('UserFont', buffer)`, adds it to `document.fonts` only after a
  successful `face.load()`, deletes the previous face on replace, and throws
  typed `FontLoadError`s (`unsupported` / `too-large` / `corrupt`) that surface
  as inline errors — a bad font never enters state or storage.
- `ThemeContext` applies `resolveTheme(state)` onto `document.documentElement`
  in an effect; components only ever read `var(--token)`, so every consumer
  repaints without knowing which layer a value came from.

First paint: a tiny inline script in `index.html` reads `app.theme.v1` and sets
the color variables before React mounts (font rehydrates a beat later by
design — colors never flash, the system font shows until the face loads).
Switching presets never clears the action accent or the font; the explicit
"Reset all" action does.

**Assumption (stated per the brief):** the action-accent override drives the
**primary buttons** and the **active-navigation marker** only. Links, badges,
avatars, status dots and the sidebar background keep the preset accent. That is
why the engine owns a separate `--btn-bg` token defaulting to the preset accent;
`--color-accent` is never overwritten.

To verify independence: pick a preset → pick an action accent → upload a font →
switch presets → navigate → reload. Everything sticks. The same controls are
available inline under **Settings → Appearance** and in the global appearance
drawer (account menu or command palette).

## 5. Shortcuts taken and why

- **No automated tests.** The 24-hour box went to the theming engine and
  contract fidelity; verification was manual (seeded browser walk-through per
  the acceptance checklist). A grader can reproduce via the steps above.
- **No Router data APIs / React Query.** Plain `useState` + small hooks keep
  the data flow readable and were enough at this scale (also stated in the
  brief's own decision notes).
- **Font stored as base64 in `localStorage`** — consistent with "theme only in
  localStorage". Large fonts above 1.5 MB are rejected up front, and
  quota/security failures degrade to a visible "session only" warning rather
  than silent failure.
- **`/users/:id` redirects to `/users?user=:id`** — the details view is a
  drawer over the list (kept in the URL so it is linkable and survives reload).
  Create/edit remain dedicated routes (`/users/new`, `/users/:id/edit`); only
  the delete confirmation is a modal, per the brief.
- **Search/pagination/sorting are server-side** — more than the brief asks,
  but the same list service made stats and filters nearly free.

## 6. Known issues

- The Google Fonts preconnect adds a small head-request even fully offline;
  the app's system stack covers offline rendering, so nothing breaks.
- The inline first-paint script in `index.html` duplicates the preset palette
  tokens (documented mirror). Updating a palette means touching both places;
  a build-time codegen step would remove the duplication.
- The command palette's user results use the list endpoint's name/email search
  with a small result cap; role and status filtering stays in the directory.
- The uploaded font lives as a base64 data URL, so a 1.5 MB file consumes
  roughly 2 MB of the origin's ~5 MB `localStorage` budget (shared with the
  theme state). Larger files are rejected up front.
- Sidebar collapse is intentionally session-only; only theme state persists.
- There is no automated browser-test suite. Verification was manual plus
  Lighthouse (Accessibility/Best Practices/SEO 100 on `/dashboard`, `/users` and
  `/settings`) — see "Shortcuts taken" above.
- Route change scrolls are instant; no scroll-restoration memory.

## 7. What I would do next

- Unit tests for `resolveTheme` (pure function — trivial to test) and the
  validator; the first-paint script would get the same constants from a
  generated module.
- Indexed text search backend (text index or Atlas Search) once datasets grow
  past regex-escape search.
- Font-face unicode-range detection so uploaded fonts only override Latin, and
  a font-size counter warning before hitting the storage quota.
- A `data-theme` CSS fallback that survives `localStorage` being disabled
  (stylesheet defaults already cover the Light preset).

---

## Project structure

```
server/src
├── app.js                  # middleware + routing assembly (strict CORS)
├── server.js               # startup, DB connect, graceful shutdown
├── seed.js                 # demo data (64 users, ~10 weeks of history)
├── config/
│   ├── env.js              # validated env, fail-fast before listening
│   └── db.js               # mongoose connection & health helpers
├── models/User.js          # schema, enums, phone 7–15 digits, unique email
├── routes/user.routes.js   # /api/users endpoints (/stats before /:id)
├── controllers/user.controller.js
├── services/user.service.js# queries, one-aggregate stats, business rules
├── validators/user.validator.js
├── middleware/   errorHandler.js, notFound.js
└── utils/        ApiError.js (typed codes), asyncHandler.js

client/src
├── components/  layout(Sidebar, Topbar, AppLayout, CommandPalette) ·
│    users(UsersTable, RecentUsersTable, UserDetailsDrawer, UserActionsMenu,
│    UserFormFields, DeleteDialog, Pagination) · theme(PresetPicker,
│    AccentPicker, FontUploader, ThemePreview, ThemeCustomizer, ThemePanel) ·
│    ui(Button, Input, Select, Icon, Modal, Drawer, Avatar, Spinner, …)
├── pages/       LandingPage.tsx, DashboardPage.tsx, UsersPage.tsx, SettingsPage.tsx,
│    UserEditorPage.tsx (`/users/new` + `/users/:id/edit`),
│    UserDetailsPage.tsx (redirects to `/users?user=:id`)
├── hooks/       useUsers.ts, useTheme.ts, useScrollLock.ts, useDialogFocus.ts
├── services/    http.ts (fetch + typed ApiError), usersApi.ts
├── themes/      presets.ts, resolveTheme.ts, themeStorage.ts,
│                fontLoader.ts, color.ts
├── context/     ThemeContext.tsx, ToastContext.tsx, AppShellContext.tsx
├── styles/      tokens.css (Light defaults), global.css
├── utils/       format.ts, platform.ts
└── types/       user.ts, theme.ts
```

## Scripts

| Location | Command        | What it does                        |
| -------- | -------------- | ----------------------------------- |
| server   | `pnpm dev`     | Nodemon dev server on :5000         |
| server   | `pnpm start`   | Production-style start              |
| server   | `pnpm seed`    | Reset + insert demo users           |
| client   | `pnpm dev`     | Vite dev server on :5173            |
| client   | `pnpm build`   | Type-check + production bundle      |
| client   | `pnpm preview` | Serve the built bundle              |
