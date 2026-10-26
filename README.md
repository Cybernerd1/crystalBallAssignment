# Forma — Admin Dashboard (MERN)

Forma is a full-stack admin dashboard: user CRUD with server-side search and
pagination, database-backed statistics, and a custom theming engine (presets,
independent accent color and custom font upload) built without any
third-party UI or theming library.

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Node.js + Express 5 (JavaScript, ESM), layered architecture
- **Database:** MongoDB via Mongoose
- **Package manager:** pnpm

---

## Walkthrough video

> _Record the 5–8 minute video and paste the link here._
>
> Suggested outline: (30s) intro & stack → (90s) backend tour: layers from
> route → validator → controller → service → model, error mapping → (2 min)
> live CRUD in the UI incl. duplicate-email 409, server-side search, changing
> counts on the dashboard → (2 min) theme engine: preset switch, accent
> override independence, font upload, navigate away & reload — everything
> sticks → (1 min) closing: fresh setup from README, env files, seed script.

---

## Quick start

Prerequisites: Node.js ≥ 20, pnpm ≥ 9 (`corepack enable pnpm`), and a running
MongoDB instance (local service or Atlas).

### 1. Backend

```bash
cd server
pnpm install
cp .env.example .env      # adjust MONGO_URI / ports if needed
pnpm seed                 # optional: clears the collection and inserts 64 demo users
pnpm dev                  # http://localhost:5000
```

### 2. Frontend

```bash
cd client
pnpm install
pnpm dev                  # http://localhost:5173
```

| Where        | URL                            | Notes                          |
| ------------ | ------------------------------ | ------------------------------ |
| Frontend app | http://localhost:5173          | Vite dev server                |
| REST API     | http://localhost:5000/api      | All user endpoints             |
| Health check | http://localhost:5000/api/health | Reports API + DB readiness   |

Environment copies to create: `server/.env` (from `server/.env.example`) and
optionally `client/.env` (from `client/.env.example`) if the API runs on a
different origin/port.

---

## Architecture

```
┌────────────────────────────┐        HTTP / JSON (REST)       ┌──────────────────────────────┐
│ client/  (React + TS)      │  ────────────────────────────▶ │ server/  (Express)           │
│                            │   /api/users (CRUD/stats)      │                              │
│  pages ─ hooks ─ services  │                                │  routes → validator →        │
│  ThemeContext ─ theme/*    │  ◀─────────── { success,      │  controller → service →      │
│  (CSS variables)           │                data, error }  │  model (Mongoose)            │
└────────────────────────────┘                                └──────────────┬───────────────┘
                                                                             ▼
       localStorage                                    ┌──────────────────────────────┐
       (theme prefs, fonts)                            │         MongoDB              │
       — independent of the API —                      │  user records & statistics   │
                                                       └──────────────────────────────┘
```

Two persistence systems, deliberately separated:

1. **User records** live in MongoDB. The backend is layered so each file has
   one job — routes only route HTTP, validators check payloads, controllers
   translate to status codes, services do business rules and DB queries, and
   the model owns schema constraints (required fields, email format/enums,
   unique index, timestamps).
2. **Theme preferences** live in the browser only (localStorage + a central
   CSS-variable applier). The theme engine never talks to the user API, which
   is why it keeps working regardless of what the CRUD demo is doing.

A consistent envelope is used for every response: `{ success, data, ... }` on
success, `{ success: false, error: { message, fields? } }` on failure.

### Backend details

- `GET /api/users` performs **server-side** search (`$or` regex on name/email,
  escaped input), role/status filters, allowlisted sorts and pagination
  (`page`, `limit` clamped to ≤ 100).
- `GET /api/users/stats` computes total / active / new-in-the-last-7-days with
  three `countDocuments` calls — no fabricated percentages; the frontend only
  derives "% of total" from real numbers.
- `/stats` is registered **before** `/:id`.
- Errors are mapped centrally: invalid id → 400, validation → 400 (with
  per-field messages), duplicate email → 409, missing record → 404, malformed
  JSON → 400, DB outage → 503. Stack traces are never sent to clients.
- Defense-in-depth without auth (which is out of scope): `helmet`, CORS
  restricted to `CLIENT_ORIGIN`, 16 kB JSON body cap, morgan request logging,
  graceful shutdown, and an abort-on-failed-connect startup path.

### Frontend details

- Pages fetch through a hook (`useUsers`, `useUserStats`) that handles
  loading / error states and supports `refetch()`.
- Search is debounced (300 ms) and, like filters/page/sort, lives in the URL
  (`?search=…&role=…&page=…`) so views are refresh-safe.
- Every mutation refreshes the affected list immediately, so dashboard counts
  are never stale when you navigate back.
- Failed saves keep forms open and surface the server's per-field errors —
  the UI never pretends a failed request succeeded.

### The theming engine

One typed state drives everything (`ThemeContext`):

```ts
interface ThemeState {
  preset: "light" | "blue" | "violet" | "dark";
  accentOverride: string | null;      // e.g. "#f59e0b"
  customFontDataUrl: string | null;   // base64 data URL
  customFontName: string | null;
}
```

- `presets.ts` defines four coordinate palettes (warm ivory / blue / violet /
  dark graphite) as token maps. Applying a theme writes those tokens onto CSS
  custom properties of `<html>` from **one place** (`applyTheme.ts`) — no
  component duplicates colors, and the dark preset flips `color-scheme`.
- The accent override satisfies `effectiveAccent = accentOverride ??
  preset.accent`, so choosing Violet then an orange accent, then switching to
  Dark, keeps the orange — hover and readable-on-accent colors are derived
  from the chosen hue at runtime.
- Font upload pipeline: type/extension checks + a conservative 2 MB cap →
  `FileReader` data URL → `FontFace` load on the `document.fonts` set →
  `--font-family` var points at `"Forma Custom Font", var(--font-family-base)`
  → state is persisted. On startup the saved font is re-registered before
  first paint; a bad font file is dropped with a visible notice instead of
  breaking the app.
- Persistence is honest about failure: `localStorage` quota/security errors
  are caught and surfaced as a "session only" warning rather than silently
  claiming the theme was saved.

To verify the independence rule: pick a preset → set a custom accent → upload
a font → navigate to another page → change preset → reload. Everything sticks.

---

## API reference

| Method | Endpoint           | Purpose                                  |
| ------ | ------------------ | ---------------------------------------- |
| GET    | `/api/users`        | List users — `page`, `limit`, `search`, `role`, `status`, `sort` |
| GET    | `/api/users/stats`  | Dashboard totals (total / active / newThisWeek) |
| GET    | `/api/users/:id`    | One user                                 |
| POST   | `/api/users`        | Create (`201`, `400` validation, `409` duplicate) |
| PUT    | `/api/users/:id`    | Partial update (`200`)                   |
| DELETE | `/api/users/:id`    | Delete (`200` returns the removed record) |
| GET    | `/api/health`       | API + database readiness                 |

Example list response:

```json
{
  "success": true,
  "data": [{ "_id": "…", "name": "Mei Wong", "email": "mei.wong3@gmail.com",
             "role": "member", "status": "active", "phone": "+1 456 1003",
             "createdAt": "2026-10-20T09:12:00.000Z", "updatedAt": "…" }],
  "pagination": { "page": 1, "limit": 8, "total": 64, "totalPages": 8 }
}
```

## Project structure

```
server/src
├── app.js                  # middleware + routing assembly
├── server.js               # startup, DB connect, graceful shutdown
├── seed.js                 # demo data (64 users, ~10 weeks of history)
├── config/db.js            # mongoose connection & health helpers
├── models/User.js          # schema, enums, unique index, timestamps
├── routes/user.routes.js   # /api/users endpoints (/stats before /:id)
├── controllers/…           # HTTP boundary + validators wiring
├── services/user.service.js# queries, pagination, stats, business rules
├── validators/user.validator.js
├── middleware/   errorHandler.js, notFound.js
└── utils/        ApiError.js, asyncHandler.js

client/src
├── components/  layout(Sidebar, Topbar, AppLayout) · users(UsersTable,
│    UserFormFields, DeleteDialog, Pagination) · theme(PresetPicker,
│    AccentPicker, FontUploader, ThemeCustomizer, ThemePanel) ·
│    ui(Icon, Modal, Drawer, …)
├── pages/       DashboardPage.tsx, UsersPage.tsx, UserEditorPage.tsx
│    (create/edit, `/users/new` + `/users/:id/edit`), UserDetailsPage.tsx
│    (`/users/:id` — read, edit and delete actions)
├── hooks/       useUsers.ts (list + stats), useTheme.ts
├── services/    http.ts (fetch + ApiError), usersApi.ts
├── context/     ThemeContext.tsx, ToastContext.tsx
├── theme/       presets.ts, applyTheme.ts, color.ts, font.ts, persistence.ts
├── styles/      tokens.css (:root defaults), global.css
└── types/       user.ts, theme.ts
```

## Scripts

| Location | Command      | What it does                        |
| -------- | ------------ | ----------------------------------- |
| server   | `pnpm dev`   | Nodemon dev server on :5000         |
| server   | `pnpm start` | Production-style start              |
| server   | `pnpm seed`  | Reset + insert demo users           |
| client   | `pnpm dev`   | Vite dev server on :5173            |
| client   | `pnpm build` | Type-check + production bundle      |
| client   | `pnpm preview` | Serve the built bundle            |

## Assignment scope decisions

- **No authentication/JWT/RBAC** — explicitly out of scope; the API is
  protected by defensive middleware instead.
- **"Live" user count** is implemented by refetching after mutations (no
  WebSockets needed at this scale).
- Themes persist **per browser**, as required; user data persists in MongoDB.
