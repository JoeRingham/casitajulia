# Architecture

A tour of how this codebase is put together, written for someone new to
Next.js. If you just want to run it, see the [README](../README.md). If you're
one of the owners, see [ADMIN-GUIDE.md](ADMIN-GUIDE.md).

---

## 1. The big idea

This is **one Next.js application** that contains two things:

|                 | The friend-facing site           | The admin panel            |
| --------------- | -------------------------------- | -------------------------- |
| URL             | `casitajulia.com/…`              | `casitajulia.com/admin`    |
| Built by        | us, from scratch                 | Payload CMS (a library)    |
| Who uses it     | friends with the shared password | the owners                 |

Both halves read and write **one Postgres database** (Supabase). There is no
separate backend server — the Next.js app _is_ the backend. It all deploys to
Vercel as a single unit.

---

## 2. Next.js concepts you need

**App Router.** The folder `src/app/` _is_ the routing table. A folder becomes a
URL segment; a `page.tsx` inside it becomes a visitable page.

```
src/app/villa/page.tsx   →   /villa
src/app/info/page.tsx    →   /info
```

**Special filenames:**

- `page.tsx` — a page you can visit
- `layout.tsx` — a wrapper rendered around every page beneath it (shared
  header/footer, the `<html>` tag)
- `route.ts` — an API endpoint instead of a page (exports `GET`, `POST`, …)
- `not-found.tsx` — the 404 for that part of the tree

**Route groups.** A folder in parentheses like `(frontend)` groups files and
lets them share a `layout.tsx` **without adding to the URL**.
`src/app/(frontend)/villa/page.tsx` is still just `/villa`. We use three groups
to keep the password page, the public site, and the admin panel cleanly
separated — each has its own root layout and its own `<html>`.

**Server Components (the default).** Every `.tsx` here runs **on the server**
unless it says otherwise. That's why a page can call the database directly with
no API layer — the browser only ever receives finished HTML.

**Client Components.** A file starting with `"use client"` also runs in the
browser and can be interactive (`useState`, `onClick`, form hooks). We need this
in exactly one place: the password form.

**Server Actions.** A function in a file marked `"use server"`. It runs on the
server but you call it straight from a form (`<form action={fn}>`) — no manual
`fetch`, no API route. We use one to check the password and set the cookie.

**`proxy.ts`.** A single file that runs on **every incoming request, before
routing**. (Next.js 16 renamed this from `middleware.ts`.) This is where the
password gate lives.

---

## 3. What's Payload vs. what's custom

**Payload gives us, for free:**

- The entire admin UI at `/admin` — login, list views, edit forms, the
  rich-text editor, image uploads, drag-to-reorder
- Admin authentication (the `admin` account, hashed password, sessions, lockout)
- A database layer — you describe "collections", Payload creates the tables and
  gives you an API to query them
- An auto-generated REST + GraphQL API at `/api/*`
- TypeScript types generated from your collections

**We wrote:**

- The shared-password gate (`proxy.ts` + `lib/gate.ts` + the `/enter` page)
- Every page of the public site
- The availability logic (bookings/blocks → a calendar of free/busy days)
- Villa-day date handling
- The _descriptions_ of the Payload collections — Payload runs them, we authored
  the fields, access rules and hooks
- The seed script

**The dividing line:** anything under `src/app/(payload)/` is Payload
boilerplate — thin files that hand control to the library, safe to ignore.
**Everything else in `src/` is ours.**

---

## 4. Directory map

### `src/app/(auth)/` — the password page _(custom)_

| File                    | What it is                                                    |
| ----------------------- | ------------------------------------------------------------ |
| `layout.tsx`            | Minimal `<html>` wrapper — no nav, just a centered box       |
| `enter/page.tsx`        | Server component; renders the form                           |
| `enter/EnterForm.tsx`   | `"use client"` — the input, submit button, error message     |
| `enter/actions.ts`      | `"use server"` — checks the password, sets the cookie, redirects |

### `src/app/(frontend)/` — the friend-facing site _(all custom)_

| File                | URL         | What it does                                                       |
| ------------------- | ----------- | ---------------------------------------------------------------- |
| `layout.tsx`        | —           | Header + nav + footer; loads fonts; fetches the footer text from the DB |
| `globals.css`       | —           | Tailwind + the (light-only) colour palette and rich-text styles     |
| `page.tsx`          | `/`         | Home: intro, hero photo, "how to book"                              |
| `villa/page.tsx`    | `/villa`    | "The Villa" content page (`<PageContent>`)                          |
| `info/page.tsx`     | `/info`     | "Stay Guide" content page (`<PageContent>`)                         |
| `calendar/page.tsx` | `/calendar` | Two-month grid of available/unavailable                             |

### `src/app/(payload)/` — the admin panel _(Payload boilerplate — don't edit)_

| File                                | Purpose                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `layout.tsx`                        | Hands the subtree to Payload's `RootLayout`                                |
| `admin/[[...segments]]/page.tsx`    | One file serving **every** admin screen. `[[...segments]]` is a catch-all route — Payload decides what to render. |
| `admin/importMap.js`                | **Generated** (`npm run generate:importmap`) — a lookup table Payload needs to bundle its editor components |
| `api/[...slug]/route.ts`            | The auto-generated REST API — `/api/bookings`, `/api/users/login`, …        |
| `api/graphql/…`                     | The GraphQL API (unused, but present)                                      |
| `custom.scss`                       | Empty — a place for admin style overrides if ever needed                   |

### `src/collections/` — the data model _(custom definitions, run by Payload)_

Each file describes one database table and its edit form. This is the part
you'll change most as the site grows.

| File                          | Table               | Notes                                                                                       |
| ----------------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `Users.ts`                    | `users`             | Admin logins. `loginWithUsername` → sign in with `admin`, no email. All operations locked to logged-in admins. |
| `VillaContent.ts` / `StayGuideContent.ts` | `villa_content` / `stay_guide_content` | The two content pages (`/villa`, `/info`). Both are one call to `makePageContentCollection` — an orderable list of sections, each `heading` + `body` (rich text) + `images` (array of media + caption). |
| `Media.ts`                    | `media`             | The one shared image library. An "upload" collection — Payload stores the file, adds `url`/`width`/…. Referenced by section images, the home hero, and rich-text embeds. |
| `Bookings.ts`                 | `bookings`          | Guest name, dates, enquiry/confirmed, private notes. `access.read` is admin-only so guest names can't leak. A `beforeValidate` hook runs the conflict check before saving. |
| `Blocks.ts`                   | `blocks`            | Non-guest unavailable periods (family use, works). Shown to friends only as "unavailable". |

`makePageContentCollection.ts` is the shared factory for the two content pages —
same pattern as `fields/villaDate.ts`. The two wrapper files just set the slug
and the sidebar labels ("The Villa" / "Stay Guide").

Two Payload terms:

- **Hook** — a function that runs at a point in the save cycle (before
  validation, after change, …). We use `beforeValidate` on Bookings to reject
  overlapping confirmed stays, and a field-level hook to normalise dates.
- **Access control** — the `access: { read, create, update, delete }` object on
  each collection. Each is a function returning `true`/`false`. This is Payload's
  permission system, enforced on the REST/GraphQL API.

### `src/globals/General.ts` — site-wide editable bits _(custom)_

A Payload "global" is a single record, not a list: owner name(s), the home
heading / intro, the home-page hero image (a `media` pick), the "how to book"
text, the footer line. The slug is `general` — that names the DB table, is read
in code as `findGlobal({ slug: "general" })`, and shows in the admin as the
**"General"** panel.

### `src/lib/` — our shared logic _(all custom, no Payload)_

| File              | Responsibility                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `gate.ts`         | The shared-password system — check the password, mint a signed cookie (JWT via `jose`), verify it. See §6.     |
| `access.ts`       | Two helpers (`authenticated`, `anyone`) reused across collections so the rules read consistently.               |
| `availability.ts` | The booking maths: bookings + blocks → `day → "available" \| "unavailable"`. Plus `assertNoConflict()`. See §7. |
| `calendar.ts`     | Villa-day normalisation + pure month-grid arithmetic. See §7.                                                   |
| `data.ts`         | Server-side fetch helpers (`getGeneral`, `getVillaContent`, `getStayGuideContent`, `getPublicAvailability`) — these call Payload's Local API. |

### `src/fields/villaDate.ts` — a reusable field _(custom)_

Bookings and Blocks each have two date fields with identical config (day-only
picker + the villa-day normalisation hook). This factory builds one, defined
once.

### `src/components/` — _(custom)_

- `MonthCalendar.tsx` — draws one month grid on the public `/calendar`. Purely
  presentational; handed a precomputed free/busy map with names already
  stripped.
- `PageContent.tsx` — renders a content page (`/villa` or `/info`): the list of
  sections with heading, rich text, and image grid. Also presentational.
- `admin/CalendarView.tsx` + `admin/AdminCalendar.tsx` + `admin/CalendarNavLink.tsx`
  — the **`/admin/calendar`** view. `CalendarView` (server) wraps the admin
  shell (`DefaultTemplate`); `AdminCalendar` (client) fetches `/api/bookings`
  and `/api/blocks` and draws a month grid with a chip per stay/block (confirmed
  = solid, enquiry = dashed, block = amber), each linking to its edit page.
  Registered via `admin.components.views.calendar` + `beforeNavLinks` in
  `payload.config.ts` (which also sets `admin.importMap.baseDir` to `src/` so the
  `/components/...#Export` paths resolve). Re-run `npm run generate:importmap`
  after adding admin components.

### `src/seed/index.ts` — _(custom)_

`npm run seed` — fills a fresh database with starter sections for both content
pages and creates the `admin` login. Idempotent: safe to re-run, never
overwrites edited content or a changed password. (An explicit
`ADMIN_RESET_PASSWORD=true` is the only way it will reset the password.)

### `src/payload-types.ts` — _(generated)_

`npm run generate:types` writes this from your collections. It's why
`general.welcomeIntro` and `section.images` are type-checked. **Never edit by
hand** — re-generate after changing a collection.

---

## 5. The data model, and how data moves

### Content pages and the image library

The two friend-facing content pages — **The Villa** (`/villa`) and **Stay
Guide** (`/info`) — are the same shape: an ordered list of sections, each with a
heading, some rich text, and an optional grid of captioned images. They're two
collections built from one factory (`makePageContentCollection`), so the admin
shows them as two separate sidebar entries while the code stays DRY.

Every image lives in **one** `media` collection. A section's `images` field is a
list of `{ image → media, caption }`; the home-page hero is `general.heroImage →
media`; rich-text embeds also upload to `media`. So the same photo can be
referenced from both pages without duplication.

### Two ways to read Payload data

- **REST / GraphQL API** (`/api/*`) — used by the admin panel's browser code and
  anything external. **Enforces access control** — that's why a friend hitting
  `/api/bookings` gets `403`.
- **Local API** — `getPayload({ config })` then `payload.find(...)`. A direct
  in-process function call, no HTTP, **bypasses access control by default**. Our
  server components use this, because _we_ control exactly what the calling
  function returns.

`src/lib/data.ts` is the safety boundary: `getPublicAvailability()` uses the
Local API to read bookings, then throws away guest names and returns only
free/busy booleans.

---

## 6. The password gate

Two independent locks:

| Lock                 | What it protects           | Mechanism                                                            | Lifetime |
| -------------------- | ------------------------- | ------------------------------------------------------------------ | -------- |
| **Friends gate**     | the whole site, `/admin` included | `proxy.ts` checks a signed cookie; `/enter` issues it after the password matches | 90 days  |
| **Admin login**      | write access to data     | Payload's own auth on `/admin`                                       | 30 days  |

`SITE_PASSWORD` is the friends password (set in Vercel env). The cookie is a JWT
signed with `GATE_SECRET`. It does **not** contain the password — it carries a
short one-way fingerprint of it. `verifyGateToken()` re-computes that fingerprint
on every request, so:

- **Change `SITE_PASSWORD`** → every friend's cookie stops matching → everyone
  re-enters the new password. (A redeploy picks up the new env value.)
- **Change `GATE_SECRET`** → the signature itself no longer verifies → same
  effect. This is the "log everyone out now" button.

The admin login is separate. Payload caps admin sessions at 30 days; changing the
admin password does not automatically end sessions already open on other devices
(a known limitation — it's one or two people, and sessions can be revoked in the
admin UI).

`/enter` also has a small artificial delay per attempt to blunt brute-forcing,
and the proxy allow-lists only `/enter` itself plus static assets.

---

## 7. Dates and the calendar

**The one rule: a date in this app always means "a calendar day at the villa"
(Deià, Mallorca), passed around as a plain `YYYY-MM-DD` string.** There is no
per-visitor timezone conversion — someone loading the site from Sydney sees the
exact same dates as someone in Palma. This is the behaviour you'd want: the
calendar is about days _at the house_.

So why is there any timezone code at all? Only for **input**. Payload's date
picker hands back a full timestamp, and the admin's browser could be in any
timezone — without normalisation, an admin in London picking "the 10th" could
get it stored as the 9th. `src/lib/calendar.ts` has one function
(`snapToVillaMidnightUTC`, wired in via `src/fields/villaDate.ts`) that pins that
timestamp to the Mallorca day the person actually picked. After that, dates are
just strings and nothing touches a timezone again.

`calendar.ts` also holds the month-grid maths (`monthGrid`, `monthLabel`,
`addMonths`, …) — pure string/number arithmetic.

**Booking semantics** (`availability.ts`):

- **Bookings** are half-open nights: check-in the 10th / check-out the 14th
  occupies the 10th–13th; the 14th is free for the next arrival.
- **Blocks** are inclusive: "from the 20th until the 27th" = all eight days
  unavailable.
- Only **confirmed** bookings and blocks make a day unavailable on the public
  calendar. Enquiries are admin-only and may overlap anything.
- `CLEANER_GAP_DAYS` (currently `0`) is the knob for reserving days after each
  check-out for the cleaner — bumping the constant is the whole change.

---

## 8. Request walk-throughs

**A friend opens `/calendar` (has the cookie):**

1. `proxy.ts` runs → cookie signature valid _and_ password fingerprint matches →
   allowed through.
2. Next routes to `src/app/(frontend)/calendar/page.tsx` (server component).
3. It calls `getPublicAvailability()` in `lib/data.ts`, which uses the Local API
   to read confirmed bookings + blocks, runs them through `lib/availability.ts`,
   and gets a `day → status` map (no names).
4. It renders `<MonthCalendar>` twice. Finished HTML goes to the browser.

**Someone with no cookie opens `/`:**

1. `proxy.ts` → no valid cookie → redirect to `/enter?next=/`.
2. `/enter` is allow-listed, so it renders.
3. They type the password → `EnterForm` calls the `submitPassword` **server
   action**.
4. The action checks the password (`lib/gate.ts`), sets the signed cookie,
   redirects back to `/`.

**Property owner edits an Info section in `/admin`:**

1. `proxy.ts` → they have the site cookie → allowed.
2. `/admin/...` is served by Payload's catch-all `page.tsx`.
3. The admin UI (Payload's browser code) calls `PATCH /api/stayGuideContent/123`.
4. That hits `api/[...slug]/route.ts` → Payload checks they're a logged-in admin →
   runs the collection hooks → writes to Postgres.
5. Next time a friend loads `/info`, the server component reads the updated row.

---

## 9. Root config files

| File                                 | Configures                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `next.config.ts`                     | Next.js. Wraps everything in `withPayload(...)` (required) and adds `noindex` headers.        |
| `src/payload.config.ts`              | **Payload itself** — which database, which storage, which collections/globals, the editor. Register new collections here. |
| `tsconfig.json`                      | TypeScript. Note the `@/*` alias → `src/`, and `@payload-config` → `src/payload.config.ts`.   |
| `package.json`                       | Dependencies and the `npm run …` scripts.                                                    |
| `eslint.config.mjs`, `postcss.config.mjs` | Linting; Tailwind's CSS build.                                                          |
| `.env` / `.env.example`              | Secrets & connection strings (`.env` is git-ignored; `.env.example` is the committed template). |
| `public/robots.txt`                  | Tells search engines not to index anything.                                                  |

---

## 10. Running and deploying

| Command                     | What happens                                                                    |
| --------------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`               | Everything on `localhost:3000`. Payload auto-syncs the DB schema as you edit collections. |
| `npm run build` / `npm start` | Production build / serve.                                                   |
| `npm run seed`              | Populate a fresh DB + create the admin login.                                 |
| `npm run generate:types`    | Rebuild `src/payload-types.ts` after changing a collection.                    |
| `npm run generate:importmap`| Rebuild the admin import map after adding custom admin components.             |

Deploy = push to GitHub → Vercel builds and hosts the app. The database lives at
Supabase, separately. A redeploy never runs the seed script.

---

## 11. Common changes

**Add a field to a collection** — edit the file in `src/collections/`, then
`npm run generate:types`. In dev, Payload syncs the DB column automatically.

**Add a public page** — create `src/app/(frontend)/whatever/page.tsx`. Add it to
the `navLinks` array in `src/app/(frontend)/layout.tsx` if it should appear in
the nav. For another editable content page, add one more
`makePageContentCollection(...)` wrapper, a `getXContent()` helper in
`lib/data.ts`, and a page that renders `<PageContent>`.

**Change the colours** — edit the CSS variables in
`src/app/(frontend)/globals.css`. It's light-only by design; the palette lives in
one `:root` block.

**Change how long friends stay signed in** — `MAX_AGE_SECONDS` in
`src/lib/gate.ts`.

**Force everyone (friends) to sign in again** — change `SITE_PASSWORD` or
`GATE_SECRET` in the Vercel env and redeploy.

**Reset a forgotten admin password** —
`ADMIN_RESET_PASSWORD=true ADMIN_PASSWORD=new npm run seed` against the target
database.

---

## 12. Deferred / not built yet

- The cleaner turnaround rule and cleaner notifications.
- iCal feed, CSV export, per-guest stay pages, email notifications.
- Restricting wifi/lockbox details to confirmed guests near their stay.
- Image upload has been exercised end-to-end locally (local-disk storage), not
  yet against a real Supabase Storage bucket.
- No lightbox on the section image grids — images aren't clickable.
