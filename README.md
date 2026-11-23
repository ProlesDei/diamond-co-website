# Diamond & Co website

The Diamond & Co website: one Next.js app (App Router, TypeScript) with Payload CMS 3 inside it. The public site is under `src/app/(frontend)`, and the admin and API are under `src/app/(payload)`.

## Install

You need pnpm 12.21.0. With Corepack, `corepack enable` picks it up from `package.json`. pnpm downloads Node 24.22.3 into `node_modules` and runs every script on it, whatever Node runs pnpm itself. `.nvmrc` names the same Node version.

```sh
pnpm install
```

The install also downloads the MongoDB server that the app runs locally.

## Run

```sh
pnpm dev
```

Open http://localhost:3000 for the site and http://localhost:3000/admin for the admin. On your first visit, the admin asks you to create the first user. That user is an admin.

With no `DATABASE_URL`, `pnpm dev` runs a MongoDB server inside the app's process. You need no account and no Docker. The data stays in `.data/` between runs. Delete `.data/` to start over. Set `DATABASE_URL` in `.env` to use another database instead. `SITE_ENV` and `SITE_URL` are build-time settings: set them when `pnpm build` runs, not only when the site runs, and rebuild after you change either. `.env.example` lists every variable.

While `pnpm dev` runs, `pnpm seed` and `pnpm uploads:prune` use the same local database.

With no `RESEND_API_KEY`, the app writes each email to `.outbox/<time>-<n>.json` instead of sending it. Password reset emails land there, for example.

## Try it

To try the site with sample content on your own machine:

1. Install, as above: `pnpm install`.
2. Copy the example settings: `cp .env.example .env`. This sets Cloudflare's test Turnstile keys, which let the booking form send without a real key. Do it before step 3: the app reads `.env` when it starts.
3. Start the app: `pnpm dev`. Leave it running.
4. In a second terminal, in this folder, fill the database with samples: `pnpm seed`.
5. Open http://localhost:3000 for the site.
6. Send a test consultation. On the home page, scroll to "Book a free consultation", choose a kind of piece and a budget range, and press "Request my consultation". The note is optional, and the form asks no name or email. The page moves to "Request sent" and shows your reference. No email is sent, and nothing is written to `.outbox/` for it.
7. Open http://localhost:3000/admin and sign in as `owner@example.test`. The password is the one `pnpm seed` printed. To choose your own, set `SEED_ADMIN_PASSWORD` before the first `pnpm seed`.
8. In the admin, open Inquiries (press "Open Menu" first if the menu is closed), then open your test consultation. It shows as New, with its reference.

`pnpm seed` adds an admin user, sample site settings, a sample Calendly link, 6 sample pieces with placeholder images, and 6 FAQs. It draws the placeholder images as it runs, so no image is stored in git. Every sample fact is marked `[confirm]`, and every image is marked as a placeholder. Run it again and it adds only what is missing; it says so when nothing is. It refuses to run when `SITE_ENV` is `production`, or when `DATABASE_URL` points at any host but `127.0.0.1`, `localhost` or `[::1]`.

The password is printed only once. If you lose it, stop the app, delete `.data/` and `media/`, and run steps 3 and 4 again.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Runs the app on http://localhost:3000. |
| `pnpm build` | Builds the app for production. |
| `pnpm start` | Runs the production build. |
| `pnpm lint` | Runs ESLint. |
| `pnpm typecheck` | Runs the TypeScript compiler. |
| `pnpm seed` | Runs `scripts/seed.ts` against the database. |
| `pnpm uploads:prune` | Runs `scripts/prune-uploads.ts` against the database. |

`pnpm dev`, `pnpm build` and `pnpm typecheck` first regenerate `src/payload-types.ts` and the admin's `src/app/(payload)/admin/importMap.js`. Both are generated, so git ignores them.

## Where things go

`src/payload.config.ts` reads collections, globals and plugins from three folders. Add yours to the folder it belongs in:

- `src/content/index.ts`: site content.
- `src/inquiry/index.ts`: inquiries from visitors.
- `src/media/index.ts`: images and other uploads. The `media` collection is here. Each file needs alt text and a source: a client photo, an atmosphere image (generated, never the client's work) or a placeholder (sample only).

The `users` collection is in `src/users/`. Users are admins or editors. Five wrong passwords in a row lock an account for 10 minutes.

## Booking link

The booking forms open a Calendly event after a send that saved. The studio sets that event in the admin: Inquiry settings → Calendly link. Any signed-in user can change it; piece types and budget ranges stay admin-only. The field takes only links that start with `https://calendly.com/` and have a path after it. Leave it empty and the forms end by asking the visitor to call or email with their reference, with no time step. A change shows on the next page load, with no rebuild or redeploy. `pnpm seed` fills an empty field with a sample link.

## Hosting on Vercel

Production writes nothing to the server's disk, so a build or start with `SITE_ENV=production` refuses to run until every other variable below is set, and names the ones that are missing. The parked ones only warn. Set them in the Vercel project's settings, by name:

- `SITE_ENV`: set it to `production`; this is what turns the refusal on.
- `DATABASE_URL`: the MongoDB connection string.
- `SITE_URL`: the site's public address. For now that is the project's .vercel.app address, such as `https://diamond-co-website.vercel.app`.
- `PAYLOAD_SECRET`: the secret Payload signs sessions with.
- `TURNSTILE_SECRET_KEY` (parked): the Cloudflare Turnstile secret that checks each booking on the server. Cloudflare's test keys in `.env.example` work for local runs and Vercel Preview builds (`VERCEL_ENV` is `preview`), never Production: with `SITE_ENV=production` anywhere else, every check is refused.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (parked): the Turnstile site key the booking form shows.
- `RESEND_API_KEY` (parked): the Resend key. It sends the admin password-reset email only; the booking forms send no email.
- `EMAIL_FROM_ADDRESS` (parked): the address the admin password-reset email comes from. The booking forms send no email.
- `EMAIL_FROM_NAME` (parked): the name the admin password-reset email comes from. The booking forms send no email.
- `BLOB_READ_WRITE_TOKEN`: the read-write token of the public Vercel Blob store, where media go.
- `INQUIRY_BLOB_READ_WRITE_TOKEN`: the read-write token of the private Vercel Blob store, where inquiry uploads go.

PARKED (owner, Nov 19, 2026): online booking and email are off for the .vercel.app run, so the five parked names only warn when unset. With both Turnstile keys unset, the spam check is skipped and the booking forms save and end normally. Move them back into `productionVariables` in `next.config.ts` to turn the refusal back on.

Vercel sets `VERCEL=1` at build and run time when the project's "Automatically expose System Environment Variables" setting is on ([Vercel's system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)). With it set, `next.config.ts` leaves `cacheHandler` unset, so Vercel's own cache serves pages and `revalidateTag` instead of `src/lib/cacheHandler.ts` writing `.next/` at run time.
