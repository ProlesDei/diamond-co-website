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

If `node_modules` is a link to a shared read-only install, `next dev` and `next build` refuse to use it. Run `rm node_modules && pnpm install --frozen-lockfile` in this folder before `pnpm dev` to give it its own install.

Open http://localhost:3000 for the site and http://localhost:3000/admin for the admin. On your first visit, the admin asks you to create the first user. That user is an admin.

With no `DATABASE_URL`, `pnpm dev` runs a MongoDB server inside the app's process. You need no account and no Docker. The data stays in `.data/` between runs. Delete `.data/` to start over. Set `DATABASE_URL` in `.env` to use another database instead. `SITE_ENV` and `SITE_URL` are build-time settings: set them when `pnpm build` runs, not only when the site runs, and rebuild after you change either. `.env.example` lists every variable.

While `pnpm dev` runs, `pnpm seed` and `pnpm uploads:prune` use the same local database.

With no `RESEND_API_KEY`, the app writes each email to `.outbox/<time>-<n>.json` instead of sending it. Password reset emails land there, for example.

## Media uploads

From **Media**, use **Create New** for one image or **Bulk Upload** to add files and edit their fields. Choose **Source** for each photo before saving. If a save fails, read the message next to the field or file.

Media accepts JPEG, PNG, WebP, AVIF, GIF and TIFF and stores JPEGs. Media uses the JPEG's EXIF orientation to match the crop to the preview. For an animated GIF or WebP or a multi-page TIFF, it uses the first frame or page. Transparent areas turn white. The Media collection sets no file-size or image-dimension limits. The site uses the sizes it can make from each photo, and uses the stored original JPEG for large displays when the photo is too small for the zoom copy. For HEIC or SVG, export a JPEG before uploading. Media takes files from your device only; pasting a URL is off.

### Service limits

With Blob configured, phone photos go from the browser to Blob before Payload converts and saves them as JPEGs. Vercel documents a default 4.5 MB Function request limit and a 5 TB maximum per Blob object. Sharp and the hosting runtime also have processing limits. [Vercel Function limits](https://vercel.com/docs/functions/limitations) and [Vercel Blob limits](https://vercel.com/docs/vercel-blob/usage-and-pricing#limits).

## Try it

To try the site with sample content on your own machine:

1. Install, as above: `pnpm install`.
2. Copy the example settings: `cp .env.example .env`. This sets Cloudflare's test Turnstile keys, which let the booking form send without a real key. Do it before step 3: the app reads `.env` when it starts.
3. Start the app: `pnpm dev`. Leave it running.
4. In a second terminal, in this folder, fill the database with samples: `pnpm seed`.
5. Open http://localhost:3000 for the site.
6. Send a test consultation. On the home page, scroll to "Book a free consultation", fill in your name and email, add a reference photo if you like, and press "Choose a time". The page saves the request, then opens the Calendly link with your name and email filled in. With no link saved in the admin, that is the placeholder link, which is not a real event. No email is sent, and nothing is written to `.outbox/` for it.
7. Open http://localhost:3000/admin and sign in as `owner@example.test`. The password is the one `pnpm seed` printed. To choose your own, set `SEED_ADMIN_PASSWORD` before the first `pnpm seed`.
8. In the admin, open Inquiries (press "Open Menu" first if the menu is closed), then open your test consultation. It shows as New, with your name, email and photo.

`pnpm seed` adds an admin user, sample site settings, 6 sample pieces with placeholder images, and 15 FAQs. Fresh settings select 5 questions for home and 14 for the FAQ page in display order. Four records, including timing, serve both pages. The seed draws the placeholder images as it runs and marks them as placeholders. Rerun it to fill missing samples in a sample database. If any FAQ lacks a recognized sample key, the seed skips all writes. Use a separate fresh database for samples if you already have editorial content. It refuses to run when `SITE_ENV` is `production`, or when `DATABASE_URL` points at any host but `127.0.0.1`, `localhost` or `[::1]`.

The password is printed only once. If you lose it, stop the app, delete `.data/` and `media/`, and run steps 3 and 4 again.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Runs the app on http://localhost:3000. |
| `pnpm build` | Builds the app for production. |
| `pnpm start` | Runs the production build. |
| `pnpm lint` | Runs ESLint. |
| `pnpm typecheck` | Runs the TypeScript compiler. |
| `pnpm test` | Runs the unit tests (`src/**/*.test.ts`) with Node's test runner. |
| `pnpm seed` | Runs `scripts/seed.ts` against the database. |
| `pnpm uploads:prune` | Runs `scripts/prune-uploads.ts` against the database. |

For a local production run with the built-in database, run `pnpm seed` before `pnpm build` so the sample piece pages prerender. To stop a background `pnpm start` that started its own MongoDB, send `TERM` to the `pid` in `.data/server.json`. This stops Next.js and its local MongoDB server, whose port is in the `uri` in that file. Check that both ports are free.

`pnpm dev`, `pnpm build` and `pnpm typecheck` first regenerate `src/payload-types.ts` and the admin's `src/app/(payload)/admin/importMap.js`. Both are generated, so git ignores them.

## Where things go

`src/payload.config.ts` reads collections, globals and plugins from three folders. Add yours to the folder it belongs in:

- `src/content/index.ts`: site content, including `testimonial-proofs`, the screenshots behind testimonials, kept in the private inquiry Blob store.
- `src/inquiry/index.ts`: inquiries from visitors.
- `src/media/index.ts`: images and other uploads. The `media` collection is here. Each file needs alt text and a source: a client photo, an atmosphere image (generated, never the client's work) or a placeholder (sample only).

The `users` collection is in `src/users/`. Users are admins or editors. Five wrong passwords in a row lock an account for 10 minutes.

## Booking link

Every booking ends on Calendly. The visitor gives a name and email, and may add one reference photo. The form saves the request with its photo, then opens the Calendly event with the name and email filled in through Calendly's `name` and `email` link parameters. Set the event in the admin: Inquiry settings → Calendly link. Any signed-in user can change it. The field takes only links that start with `https://calendly.com/` and have a path after it. A change shows on the next page load, with no rebuild or redeploy.

PLACEHOLDER: until someone saves a link there, bookings go to `https://calendly.com/diamond-co-placeholder/consultation` (`CALENDLY_PLACEHOLDER_LINK` in `src/lib/calendly.ts`), which is not a real event. Save the studio's real Calendly link before the site takes bookings.

## Testimonials

In the admin, open Testimonials. Each one has a source (Google review or personal testimonial), a name, the quote and an optional proof screenshot. The home page shows the source under each name and the screenshot under the quote. Upload screenshots from the proof field; they go to Testimonial proofs. A screenshot is visible to visitors only while a published testimonial with consent on file uses it. Testimonials saved before the source field existed show as personal ones. Only published testimonials with consent on file show.

## Designer and home questions

In the admin, open Site Settings → Designer to set the name, credential line and portrait. Use a client photo in production. Local and preview sites also accept placeholder images. Blank fields give visitors a generic name and hide the credential or photo.

Create and publish answers in FAQs. In Site Settings → Home questions, choose which ones to show and drag them into order. Save an empty list to hide the Questions section. Drafts, unpublished answers and deleted records stay off the public page. Published answers can show Media images and link to published commissions. If a linked commission is unavailable, the answer shows its link text as plain text.

Deploy normally with the existing database. No migration or seed command is needed. Existing sites show the five built-in home questions until an editor saves a selection. To set the list, find the records you want in FAQs, including the timing FAQ under its current title. Create and publish any missing questions. Choose the records in Site Settings → Home questions, drag them into order and save. This lets you reuse a renamed question with its edited answer.

To roll back, redeploy the previous build with the same database. It shows the prior built-in profile and questions. Leave the new fields and FAQ records in place so they are available if you redeploy this version.

### FAQ page

To edit `/faq`, open Site Settings → FAQ page. Add topics, pick a published FAQ for each question, drag them into order and save. Use the same FAQ record on both pages when they share an answer. Use the optional label if the FAQ page needs a different question title. Unpublished and deleted records disappear from the list. With no published question in any topic, the page shows the selection saved by an earlier build, or its built-in questions if there is none.

Deploy with the existing database. There are no migrations or seed commands. A selection saved by an earlier build keeps showing on `/faq`, under its old topic titles and links, until an editor saves a topic with a published question. The admin shows only saved topics, so Topics starts empty after the upgrade. The earlier selection stays in the database untouched. To roll back the release, redeploy the previous build with the same database and leave the new settings and FAQ records in place. The previous build reads the earlier selection as before and still reads the same home selection.

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
- `INQUIRY_BLOB_READ_WRITE_TOKEN`: the read-write token for the private Vercel Blob store that holds inquiry photos and testimonial proof screenshots. Visitors' photos upload straight to it. The site serves both only through its own file routes, after their access checks.

PARKED (owner, Nov 19, 2026): online booking and email are off for the .vercel.app run, so the five parked names only warn when unset. With both Turnstile keys unset, the spam check is skipped and the booking forms save and end normally. Move them back into `productionVariables` in `next.config.ts` to turn the refusal back on.

Vercel sets `VERCEL=1` at build and run time when the project's "Automatically expose System Environment Variables" setting is on ([Vercel's system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)). With it set, `next.config.ts` leaves `cacheHandler` unset, so Vercel's own cache serves pages and `revalidateTag` instead of `src/lib/cacheHandler.ts` writing `.next/` at run time.
