# Forma — User Management Dashboard with Custom Theming Engine

Forma is a MERN take-home build: a user management dashboard (CRUD + live
counts, all data in MongoDB) plus a self-built theming engine — four presets,
a button-color override and a custom font upload, live on screen and persisted
in `localStorage`. No authentication, no third-party UI/theming library.

- **Frontend:** React 19 + TypeScript (strict) + Vite
- **Backend:** Node.js + Express 5 (JavaScript, ESM), layered architecture
- **Database:** MongoDB via Mongoose
- **Package manager:** pnpm

## Walkthrough video

> _Placeholder — record the 5–8 minute video and paste the link here._

**Suggested outline (maps to PRD §12):**
(0:00–0:45) what was understood and scoped, prioritizing the theming engine →
(0:45–1:45) architecture: browser → Express layers → Mongo, one round trip →
(1:45–3:15) the most important workflow end-to-end: create a user with
validation, follow route → controller → service → Mongoose, show the document
and the live dashboard count → (3:15–5:15) theming: switch presets, pick a
button color, switch preset again to prove the override survives, upload a
font, reload; then walk `resolveTheme` and explain the three independent
layers → (5:15–6:00) backend piece of pride: the central error handler and
duplicate-email 409 → (6:00–7:00) shortcuts, known issues, fresh setup.

---

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
| **A. Product basic views** — Dashboard (live counts), Users list | Done — counts refetch on mount and after every mutation |
| **B. User management CRUD** | Done — create/edit/view/delete on dedicated routes (`/users/new`, `/users/:id`, `/users/:id/edit`), delete confirmation naming the user, focus landing on Cancel, Esc closes |
| **C. Validation (client + server)** | Done — inline errors on blur and submit, server field errors mapped back onto inputs (duplicate email lands under the email box) |
| **D. Theming engine** | Done — 4 presets (Blue default / Violet / Darcula / Forest), button-color override with luminance-based text, custom font upload, live repaint, `localStorage` persistence |
| **E. Persistence + API contract** | Done — Mongo for users only, `localStorage` for theme only; `{ error: { code, message, fields } }` contract |
| Stretch | Server-side search/filter/sort/pagination (debounced search, URL-synced state) |

## 4. Theming architecture note

The active theme is always **derived, never stored as CSS**. State holds three
independent values — `presetId`, `buttonColor` (nullable) and `font`
(`{ fileName, dataUrl }` or null) — and a pure function turns that state into
CSS variables:

- `themes/presets.ts` — typed preset definitions only (Blue, Violet, Darcula,
  Forest). These are the only hex literals in `src/` plus their documented
  first-paint mirror in `index.html`.
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
Switching presets never clears the button override or the font; the explicit
"Reset all" action does.

**Assumption (stated per the brief):** the "button color" override changes the
primary button background, its hover shade and its text color only — links,
badges, the sidebar and avatars keep the preset accent. That is why the
engine owns a separate `--btn-bg` token defaulting to the preset accent.

To verify independence: pick a preset → pick a button color → upload a font →
switch presets → navigate → reload. Everything sticks.

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
- **`/users/:id` is a full page, not a modal** (exceeds the brief's minimum;
  modals were harder to keep accessible for create/delete... the delete
  *confirmation* is still a modal, per brief).
- **Search/pagination/sorting are server-side** — more than the brief asks,
  but the same list service made stats and filters nearly free.

## 6. Known issues

- The Google Fonts preconnect adds a small head-request even fully offline;
  the app's system stack covers offline rendering, so nothing breaks.
- The inline first-paint script in `index.html` duplicates the preset palette
  tokens (documented mirror). Updating a palette means touching both places;
  a build-time codegen step would remove the duplication.
- The theme drawer is keyboard-accessible (Esc closes) but does not implement
  a full focus trap; the delete dialog does trap-free auto-focus Cancel.
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
  (stylesheet defaults already cover the Blue preset).

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
├── components/  layout(Sidebar, Topbar, AppLayout) · users(UsersTable,
│    UserFormFields, DeleteDialog, Pagination) · theme(PresetPicker,
│    AccentPicker, FontUploader, ThemeCustomizer, ThemePanel) ·
│    ui(Button, Input, Select, Icon, Modal, Drawer, Spinner, …)
├── pages/       DashboardPage.tsx, UsersPage.tsx, UserEditorPage.tsx
│    (create/edit, `/users/new` + `/users/:id/edit`), UserDetailsPage.tsx
├── hooks/       useUsers.ts (list + stats), useTheme.ts
├── services/    http.ts (fetch + typed ApiError), usersApi.ts
├── themes/      presets.ts, resolveTheme.ts, themeStorage.ts,
│                fontLoader.ts, color.ts
├── context/     ThemeContext.tsx, ToastContext.tsx
├── styles/      tokens.css (Blue defaults), global.css
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
