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

With no `DATABASE_URL`, `pnpm dev` runs a MongoDB server inside the app's process. You need no account and no Docker. The data stays in `.data/` between runs. Delete `.data/` to start over. Set `DATABASE_URL` in `.env` to use another database instead. `.env.example` lists every variable.

While `pnpm dev` runs, `pnpm seed` and `pnpm uploads:prune` use the same local database.

With no `RESEND_API_KEY`, the app writes each email to `.outbox/<time>-<n>.json` instead of sending it. Password reset emails land there, for example.

## Try it

To try the site with sample content on your own machine:

1. Install, as above: `pnpm install`.
2. Start the app: `pnpm dev`. Leave it running.
3. In a second terminal, in this folder, fill the database with samples: `pnpm seed`.
4. Open http://localhost:3000 for the site.
5. Open http://localhost:3000/admin and sign in as `owner@example.test`. The password is the one `pnpm seed` printed. To choose your own, set `SEED_ADMIN_PASSWORD` before the first `pnpm seed`.

`pnpm seed` adds an admin user, sample site settings, 6 sample pieces with placeholder images, and 6 FAQs. It draws the placeholder images as it runs, so no image is stored in git. Every sample fact is marked `[confirm]`, and every image is marked as a placeholder. Run it again and it adds only what is missing; it says so when nothing is. It refuses to run when `SITE_ENV` is `production`, or when `DATABASE_URL` points at any host but `127.0.0.1`, `localhost` or `[::1]`.

The password is printed only once. If you lose it, stop the app, delete `.data/` and `media/`, and run steps 2 and 3 again.

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

## Hosting on Vercel

Production writes nothing to the server's disk, so a build or start with `SITE_ENV=production` refuses to run until every other variable below is set, and names the ones that are missing. The parked ones only warn. Set them in the Vercel project's settings, by name:

- `SITE_ENV`: set it to `production`; this is what turns the refusal on.
- `DATABASE_URL`: the MongoDB connection string.
- `SITE_URL`: the site's public address. For now that is the project's .vercel.app address, such as `https://diamond-co-website.vercel.app`.
- `PAYLOAD_SECRET`: the secret Payload signs sessions with.
- `TURNSTILE_SECRET_KEY` (parked): the Cloudflare Turnstile secret that checks each booking on the server.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (parked): the Turnstile site key the booking form shows.
- `RESEND_API_KEY` (parked): the Resend key that sends the staff alert and the visitor's auto-reply.
- `EMAIL_FROM_ADDRESS` (parked): the address those emails come from.
- `EMAIL_FROM_NAME` (parked): the name those emails come from.
- `BLOB_READ_WRITE_TOKEN`: the read-write token of the public Vercel Blob store, where media go.
- `INQUIRY_BLOB_READ_WRITE_TOKEN`: the read-write token of the private Vercel Blob store, where inquiry uploads go.

PARKED (owner, Nov 19, 2026): online booking and email are off for the .vercel.app run, so the five parked names only warn when unset, and the booking forms show their failed message. Move them back into `productionVariables` in `next.config.ts` to turn the refusal back on.

Vercel sets `VERCEL=1` at build and run time when the project's "Automatically expose System Environment Variables" setting is on ([Vercel's system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)). With it set, `next.config.ts` leaves `cacheHandler` unset, so Vercel's own cache serves pages and `revalidateTag` instead of `src/lib/cacheHandler.ts` writing `.next/` at run time.
