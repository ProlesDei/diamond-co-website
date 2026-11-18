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
