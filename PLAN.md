# Implementation plan — PRD alignment

Tracks the migration of the existing build to the PRD
("User Management Dashboard with Custom Theming Engine", Oct 2026).

Checkboxes are updated as each step is executed.

> **Note (redesign pass):** the UI was later redesigned to a premium,
> Linear/Raycast-inspired product interface. That brief supersedes the original
> PRD's `Blue / Violet / Darcula / Forest` preset list — the shipped presets are
> **Light (default) / Blue / Violet / Dark** — while the API contract, CRUD
> behaviour and persistence model are unchanged. See “Redesign pass” below.

## Redesign pass (final)

Scope: presentation only. No backend rewrite, no mock APIs, and no user records
in `localStorage`. The later dashboard landing pass adds GSAP and Three.js only
for the home-page motion layer.

| Area | Delivered |
| --- | --- |
| Theme presets | Light (`#F7F6F2` paper / vermilion), Blue, Violet, Dark; coordinated tokens incl. muted text, borders, overlays, shadows |
| Action accent | Independent of preset; drives primary buttons + active-nav marker via `--btn-bg*`; luminance-picked text; survives preset switches and reload |
| Typography | Inter with system fallback; monospace reserved for technical metadata; uploaded font is global and persisted |
| Shell | 224px sidebar (64px compact), minimal brand, three nav items, narrow active indicator; 60px topbar with search trigger, notifications and account menus |
| Command palette | `Ctrl/Cmd+K`, real backend user search, page/action commands, keyboard navigation, focus trap, layered Esc |
| Landing + Dashboard | Public landing page at `/` with header, hero, explanatory sections, theme preview, footer and dashboard CTA; workspace at `/dashboard` with editorial heading, compact Total/Active/New-this-week strip, tabular numerals, recent-user table → details drawer |
| Users | Server-backed search/role/status filters/sort/pagination synced to the URL; differentiated Add User; row action menu; details drawer; delete confirmation |
| Settings | `/settings` page: appearance inline + shared appearance drawer; presets, accent picker (swatches + hex), font upload guidance, live preview, reset |
| Overlays | Focus trap/restore, reference-counted scroll lock, Esc closes top layer only, reduced-motion respected |
| Responsive | Desktop → phone (420px): mobile nav drawer, icon-only search, stacked filters, hidden secondary columns, full-width drawers, no document overflow |
| Accessibility | Skip link, landmarks, visible focus rings, accessible names, WCAG AA contrast, Lighthouse 100s on `/`, `/users` and `/settings` (A11y/Best Practices/SEO) |
| Docs | README and this plan updated for presets, accent semantics, `/users/:id` redirect, `/settings`, accessibility and responsive notes |

Checks completed: `pnpm build` clean; CRUD create/edit/delete and duplicate-email
409 verified in-browser; palette search/navigation; list filters, sorting,
pagination and URL state; all presets, custom accent, font upload/persistence
and reset; overlay focus/Esc layering; responsive checks at 760/620/420px;
Lighthouse audits on `/dashboard`, `/users`, `/settings`. Remaining deliverable: the
walkthrough video.

## Dashboard landing pass

The existing CRUD and theming work is now presented through a more considered
public landing surface at `/`, with the operational dashboard moved to
`/dashboard`. This pass is intentionally presentation-only: it does not replace
the API contract, add user data to client storage, or change the theme
composition model.

| Area | Delivered |
| --- | --- |
| Landing page | Header, hero, three explanatory sections, theme preview, final CTA and footer |
| Dashboard | Focused workspace overview with live metrics, recent users and direct CRUD actions |
| Three.js scene | Small wireframe signal sculpture with rings and particles; uses the active action accent |
| GSAP motion | ScrollTrigger scrub for the scene and copy, plus a restrained intro reveal; scoped to `.app__content` |
| Responsive behavior | Scene scales down and keeps the data-driven overview immediately below the fold on smaller screens |
| Accessibility | Hero actions remain normal links, decorative canvas is `aria-hidden`, and reduced-motion CSS hides the canvas |
| Documentation | README now documents the motion layer, its scroller, and the visual choices |

Implementation files: `client/src/components/dashboard/DashboardHero.tsx`,
`client/src/components/dashboard/SignalScene.tsx`, and the dashboard landing
section in `client/src/styles/global.css`.

## Gap audit (current build vs PRD)

| Area | Current state | PRD requires | Action |
| --- | --- | --- | --- |
| CRUD + persistence | Done (create/edit/view/delete, Mongo, restart-safe) | U1–U7 | Keep |
| Server-side search/pagination | Done (exceeds brief — stretch item) | stretch | Keep, document as extra |
| Error format | `{ success, error:{message,fields} }` | `{ error:{ code, message, fields } }` | Add machine codes, drop `success` |
| Delete response | returns full document | `{ data: { id } }` | Change |
| Stats | 3 × `countDocuments`, `{total,active,newThisWeek}` | 1 aggregate `{total,active,inactive,last7Days}` | Rewrite |
| Role enum | admin/member/editor (default member) | admin/editor/viewer (default viewer) | Change |
| Status / phone | status default inactive; phone ≤20 chars any digits | status default active; phone 7–15 digits | Change |
| Env | `MONGO_URI`, optional `CLIENT_ORIGIN` (reflect-all fallback) | `MONGODB_URI` required, fail fast, strict CORS, `config/env` module | Rewrite config |
| Presets | Light/Blue/Violet/Dark, own values | Blue/Violet/Darcula/Forest (exact values, default **blue**) | Replace — **superseded by redesign**: final presets are Light (default) / Blue / Violet / Dark |
| Button override | recolors global accent | buttons only via `--btn-bg`/`--btn-text` (luminance-computed) | Re-architect |
| Theme modules | `applyTheme`, `persistence.ts`, `font.ts` | `resolveTheme` (pure), `themeStorage` (single localStorage file, key `app.theme.v1`), `fontLoader` (typed errors) | Rename/rewrite |
| Font state shape | two top-level fields | `font: { fileName, dataUrl }` | Change |
| Font live load | from data URL | from ArrayBuffer (data URL only for storage) | Change |
| First paint | main.tsx pre-paint only | inline script in `index.html` | Add |
| Validation UX | submit-time client validation | also on blur | Add touched-state |
| Delete dialog | Esc closes; no focus management | focus lands on Cancel | Add autoFocus |
| UI primitives | CSS classes only | `Button`, `Input`, `Select` components used everywhere | Add + adopt |
| Git history | no repo | commits show steps | Init + staged commits |
| README | has setup/API/theming | §11.2 outline + architecture note + shortcuts/known issues/assumption | Rewrite |

## Backend plan

- [x] B1 — `config/env.js`: validated env (`PORT`, `MONGODB_URI` required, `CLIENT_ORIGIN` required, `NODE_ENV`); fail fast before listening
- [x] B2 — rename `MONGO_URI` → `MONGODB_URI` in `db.js`, `.env`, `.env.example` (+ Atlas example comment)
- [x] B3 — model: role `admin/editor/viewer` (default `viewer`), status default `active`, phone 7–15 digit loose pattern
- [x] B4 — server validator: same rules (phone digit count), defaults aligned
- [x] B5 — `ApiError` + central handler carry `code` (`VALIDATION_ERROR`, `DUPLICATE_EMAIL`, `INVALID_ID`, `NOT_FOUND`, `PARSE_ERROR`, `DB_UNAVAILABLE`, `UNEXPECTED_ERROR`); no stack traces
- [x] B6 — responses: `{ data }` envelopes; DELETE returns `{ data: { id } }`
- [x] B7 — stats via single aggregation returning `{ total, active, inactive, last7Days }`
- [x] B8 — strict CORS from `env.clientOrigins`; keep helmet + body limit; smoke-test against the new contract

## Frontend plan

- [x] F1 — `themes/color.ts`: rgb-based mixing + WCAG relative-luminance helpers
- [x] F2 — `themes/resolveTheme.ts`: pure `(state) => Record<string, string>` with button text contrast
- [x] F3 — `themes/themeStorage.ts`: only file touching localStorage; key `app.theme.v1`; safe parse
- [x] F4 — `themes/fontLoader.ts`: load from ArrayBuffer, remove previous face, typed `FontLoadError`, MIME+extension+size checks, rehydrate from data URL
- [x] F5 — `themes/presets.ts`: Blue / Violet / Darcula / Forest with PRD values (+ muted, border, danger, colorScheme, sidebar, shadows)
- [x] F6 — `ThemeState = { presetId, buttonColor, font }`; ThemeContext applies `resolveTheme` output; default preset `blue`
- [x] F7 — override affects only `--btn-bg` / `--btn-text` / `--btn-bg-hover`; preset switch never clears override or font
- [x] F8 — theme components updated (PresetPicker, button-color picker incl. yellow, FontUploader with `font.fileName`); reset returns to defaults
- [x] F9 — inline pre-paint script in `index.html` (colors before React mounts; documented mirror of presets)
- [x] F10 — `tokens.css` fallback palette converted off raw hex; `font: inherit` guard verified on form controls
- [x] F11 — user API/types updated to PRD contract (`last7Days`, `viewer`, `{ data:{ id } }` delete); dashboard cards updated
- [x] F12 — `ui/Button`, `ui/Input`, `ui/Select` primitives and adoption across forms, toolbar, dialogs, headers
- [x] F13 — validation on blur (touched fields) + submit; delete dialog focuses Cancel
- [x] F14 — grep check: no leftover hex outside `presets.ts`/inline mirror; build clean

## Docs & submission

- [x] D1 — PLAN.md (this file) maintained during execution
- [x] D2 — README rewritten to PRD §11.2 outline (theming note, shortcuts, known issues, assumption)
- [x] D3 — git repo initialized; step-wise commits (baseline/backend → theme engine → client contract → docs)
- [x] D4 — fresh-clone + seed + dev verification; smoke test suite green against PRD contract

## Final acceptance (PRD §13, run before recording the video)

- [x] `pnpm install && pnpm dev` works in `server/` and `client/` with only `.env` created
- [x] Seed populates sample users and is safe to run twice
- [x] Create/edit/view/delete persist after hard refresh and server restart
- [x] Duplicate email → 409 shown on the email field
- [x] `PUT` with invalid email rejected server-side
- [x] Invalid id → 400, unknown id → 404; `/users/stats` not captured by `/:id`
- [x] Delete confirmation; Cancel deletes nothing
- [x] Dashboard count correct after add/delete without manual reload
- [x] No user data in localStorage
- [x] 4 presets (Light, Blue, Violet, Dark) repaint both pages live
- [x] Action accent override survives preset switch + reload (yellow stays readable); preset accent restores on reset
- [x] Font changes headings, table, modal/form inputs
- [x] Reload restores preset, action accent, font; cleared storage → Light + system font
- [x] Corrupt/wrong-type file shows error, keeps prior font
- [x] No hardcoded colors outside `presets.ts` (inline first-paint mirror documented)
- [x] Routes/controllers/models separated; central error handler
- [x] No fetch calls inside components; localStorage touched by `themeStorage` only
- [x] No `any`, no dead code, no console.log noise
- [x] Loading/empty/error states on both pages
- [x] Sidebar collapse, mobile nav drawer, command palette, details drawer and appearance drawer verified
- [x] Users search/filters/sorting/pagination mirror the server and the URL
- [x] `/users/:id` redirects to `/users?user=:id`; `/settings` hosts appearance settings
- [x] Overlays trap focus, restore the opener and close in layers on Esc
- [x] Layout holds without document overflow at 760 / 620 / 420px
- [x] Lighthouse `/`, `/users` and `/settings`: Accessibility 100, Best Practices 100, SEO 100
- [x] README complete (shortcuts, known issues, button-color assumption)
- [x] Theming architecture note matches the real code
- [x] No secrets in repo or history
- [ ] Video recorded (5–8 min) per the §12 plan
