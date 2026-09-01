# Casita Julia

A small, private website for the family house in Deià, Mallorca. Friends sign in
with one shared password to see when the house is free and find everything they
need for a stay. Julia and Neal manage dates and content from an admin panel.

There is **no payment and no self-service booking** — booking stays as "message
Julia and Neal, they confirm it here."

## Stack

- **Next.js 16** (App Router, Turbopack) — deploys to Vercel
- **Payload CMS 3** embedded in the same app — admin panel at `/admin`
- **Supabase** — Postgres database + Storage (S3) for photos
- Shared-password gate in front of the whole site (`src/proxy.ts`)

## Local development

Prereqs: Node 20.9+ and a Postgres database (local, or a Supabase project).

```bash
npm install
cp .env.example .env      # then fill in the values (incl. ADMIN_PASSWORD)
npm run seed              # starter content + creates the admin login
npm run dev               # http://localhost:3000
```

First run:

1. Open the site → you'll be sent to `/enter`. Type `SITE_PASSWORD`.
2. Go to `/admin` → log in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
   Change it from the account menu once you're in; the seed won't overwrite it.
   Forgotten it? `ADMIN_RESET_PASSWORD=true npm run seed`.

### Environment variables

| Var | What it is |
| --- | --- |
| `PAYLOAD_SECRET` | Long random string; signs admin sessions. |
| `DATABASE_URI` | Postgres connection string. For Supabase use the **Session pooler** URI. |
| `SITE_PASSWORD` | The shared password Julia gives to friends. |
| `GATE_SECRET` | Signs the friends-gate cookie. Defaults to `PAYLOAD_SECRET` if unset. |
| `S3_BUCKET` etc. | Supabase Storage (S3) for uploads. Leave `S3_BUCKET` blank to use local disk in dev. |

See `.env.example` for the full list and formats.

## Deploying to Vercel

1. Push to the `casitajulia` GitHub repo.
2. Import it in Vercel. Framework preset: **Next.js**. No build-command changes.
3. Add all the env vars from `.env.example` (Production + Preview).
4. Add the domain `casitajulia.com`.
5. Deploy. Run the seed once against the production DB (locally, with the
   production `DATABASE_URI` + `ADMIN_PASSWORD` in your shell) to create the
   admin login, then sign in at `/admin`.

Uploads need `S3_*` set in production — Vercel's filesystem is read-only, so
local-disk storage won't work there.

## How it fits together

| Path | Purpose |
| --- | --- |
| `src/proxy.ts` | Shared-password gate over the whole site (Next 16 "proxy"). |
| `src/lib/gate.ts` | Signs / checks the friends cookie. |
| `src/payload.config.ts` | Payload config: DB, storage, collections. |
| `src/collections/*` | `users`, `media`, `photos`, `sections`, `bookings`, `blocks`. |
| `src/globals/Settings.ts` | Editable site copy — labelled "General" in the admin. |
| `src/lib/availability.ts` | Turns bookings + blocks into "available / unavailable" days. |
| `src/lib/calendar.ts` | Villa-day normalisation + month-grid maths. |
| `src/app/(frontend)/*` | The friend-facing site. |
| `src/app/(auth)/enter` | The password page. |
| `src/app/(payload)/*` | The admin panel (generated wiring — leave alone). |

Full walkthrough: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

### Data model notes

- **Bookings** use half-open nights: check-in the 10th / check-out the 14th
  occupies the 10th–13th; the 14th is free for the next arrival.
- **Blocks** (family use, maintenance, closed seasons) are inclusive: "from the
  20th until the 27th" means all eight days are unavailable.
- Only **confirmed** bookings and blocks appear on the public calendar.
  Enquiries are visible to admins only and may overlap freely.
- Guest names and block reasons never leave the server for the public calendar —
  friends only ever see "available / unavailable".
- A cleaner-turnaround gap is wired through (`CLEANER_GAP_DAYS` in
  `src/lib/availability.ts`) but set to `0` for now.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server. |
| `npm run build` / `npm start` | Production build / serve. |
| `npm run seed` | Idempotent starter content. |
| `npm run generate:types` | Rewrite `src/payload-types.ts` after changing collections. |
| `npm run generate:importmap` | Rewrite the admin import map after adding custom admin components. |

## For Julia & Neal

See [`docs/ADMIN-GUIDE.md`](docs/ADMIN-GUIDE.md).
