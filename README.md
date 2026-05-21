# IndiaMART Clone — B2B Marketplace

A production-quality B2B marketplace web portal inspired by IndiaMART, built as a full-stack monorepo with a Next.js 15 frontend and a NestJS 11 backend backed by PostgreSQL 16.

> **Status:** All end-to-end marketplace flows are live — auth (with buyer→seller upgrade), full catalog (categories, products, images), supplier directory + public profiles, unified search, inquiries with threaded messaging, buy-leads (requirements), wishlist (saved products), seller KPI dashboard, and an admin console. Image uploads support both AWS S3 (presigned PUT) and a local-disk fallback. See [`docs/architecture.md`](docs/architecture.md) for the full architecture overview.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [First-Time Setup](#first-time-setup)
- [Database Setup](#database-setup)
- [Running Dev Servers](#running-dev-servers)
- [Smoke Checks](#smoke-checks)
- [Useful Commands](#useful-commands)
- [Environment Variables](#environment-variables)
- [Frontend Route Map](#frontend-route-map)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Catalog](#catalog)
  - [Suppliers, Inquiries, Requirements, Saved, Search](#suppliers-inquiries-requirements-saved-search)
  - [Seller Dashboard & Admin](#seller-dashboard--admin)
  - [Image Uploads](#image-uploads)
- [Default Seed Data](#default-seed-data)
- [Project Conventions](#project-conventions)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer        | Technology                                                                          |
| ------------ | ----------------------------------------------------------------------------------- |
| Frontend     | Next.js 15 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS v4         |
| State        | Redux Toolkit (auth + UI state), TanStack Query v5 (server state)                   |
| Backend      | NestJS 11, TypeScript 5, Sequelize-TypeScript, Joi config validation                |
| Database     | PostgreSQL 16 (`uuid-ossp`, `pg_trgm`, `unaccent`)                                  |
| Auth         | JWT access (15 min, in-memory) + refresh (7 days, httpOnly cookie), bcrypt (12 rounds) |
| Object Store | AWS S3 via presigned PUT URLs **or** local-disk fallback (`uploads/`)               |
| Testing      | Jest (backend), Vitest (frontend)                                                   |
| Tooling      | npm workspaces, ESLint, Prettier, Docker Compose, GitHub Actions CI                 |

---

## Repository Layout

```
indiamart-clone/
├── backend/                  NestJS API (port 3001)
│   ├── src/
│   │   ├── common/           Guards, decorators, health, utils
│   │   ├── config/           Joi-validated env config
│   │   ├── database/         Migrations, seeders, models
│   │   └── modules/          Domain modules (auth, products, sellers, …)
│   └── package.json
├── frontend/                 Next.js app (port 3000)
│   ├── src/
│   │   ├── app/              App Router route groups
│   │   ├── components/       Shared UI primitives
│   │   ├── features/         Feature-sliced modules
│   │   ├── hooks/            Shared custom hooks
│   │   ├── lib/              Axios instance, utilities
│   │   ├── store/            Redux store (auth + ui slices)
│   │   └── types/            Shared TypeScript types
│   └── package.json
├── docker/                   Container init scripts (Postgres bootstrap SQL)
├── docs/                     Architecture docs
├── .github/workflows/        CI (lint + build + tests, both workspaces)
├── docker-compose.yml        Local Postgres 16 + pgAdmin
└── package.json              npm workspaces root
```

---

## Prerequisites

| Tool           | Version      | Notes                                                                                   |
| -------------- | ------------ | --------------------------------------------------------------------------------------- |
| Node.js        | `>= 20.10.0` | Pin via `.nvmrc`. Windows: install via `nvm-windows` or `winget install OpenJS.NodeJS`. |
| npm            | `>= 10`      | Ships with Node 20.                                                                     |
| Docker Desktop | latest       | Required to run Postgres locally via `docker-compose.yml`.                              |
| Git            | any recent   |                                                                                         |

Optional: pgAdmin is auto-launched at <http://localhost:5050> when you run `db:up`.

---

## First-Time Setup

```bash
# 1. Copy env templates
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 2. Install dependencies for both workspaces
npm install

# 3. Start Postgres + pgAdmin (Docker Desktop must be running)
npm run db:up

# 4. Verify Postgres is healthy
docker compose ps
```

> **Windows tip.** If `npm install` is slow due to antivirus scanning `node_modules`, exclude the repo's `node_modules` directories from real-time scanning.

After copying `backend/.env`, open it and fill in at minimum:

- `JWT_SECRET` — at least 32 characters
- `JWT_REFRESH_SECRET` — at least 32 characters (different from `JWT_SECRET`)

The backend will fail fast on boot if these are missing or too short (Joi validation).

---

## Database Setup

After `db:up` is healthy, run migrations and seeders:

```bash
npm run migrate   # creates all tables
npm run seed      # creates default admin + category tree
```

Other migration commands:

```bash
npm run migrate:undo        # rollback last migration
npm run migrate:undo:all    # rollback all migrations
npm run seed:undo:all       # remove all seeded rows
```

Default admin credentials (override via env vars before seeding):

| Field    | Value                  | Override env var  |
| -------- | ---------------------- | ----------------- |
| Email    | `admin@indiamart.local`| `ADMIN_EMAIL`     |
| Password | `ChangeMe@123`         | `ADMIN_PASSWORD`  |
| Name     | `Admin`                | `ADMIN_NAME`      |

**Rotate these before any non-local deployment.**

---

## Running Dev Servers

Run each in a separate terminal:

```bash
# Backend (NestJS, watch mode) → http://localhost:3001
npm run dev:backend

# Frontend (Next.js + Turbopack) → http://localhost:3000
npm run dev:frontend
```

---

## Smoke Checks

| Check                | URL                                           | Expected                                              |
| -------------------- | --------------------------------------------- | ----------------------------------------------------- |
| Backend liveness     | http://localhost:3001/api/v1/health           | `{ "status": "ok", ... }`                             |
| Backend DB readiness | http://localhost:3001/api/v1/health/db        | `{ "database": { "connected": true, ... } }`          |
| Swagger / OpenAPI    | http://localhost:3001/api/docs                | Swagger UI (non-production only)                      |
| Upload backend       | http://localhost:3001/api/v1/uploads/status   | `{ "storage": "s3" \| "local", ... }`                 |
| Frontend home        | http://localhost:3000                         | Redirects to `/me/dashboard` (login if logged out)    |
| Login page           | http://localhost:3000/login                   | Centered card; works against the seeded admin         |
| Register page        | http://localhost:3000/register                | Buyer signup + seller upgrade modal entry point       |

---

## Useful Commands

```bash
# Lint everything
npm run lint
npm run lint:fix

# Format with Prettier
npm run format
npm run format:check

# Run all tests (backend: Jest; frontend: Vitest)
npm test

# Frontend only
npm run dev:frontend
npm run build:frontend
npm test --workspace=frontend

# Backend only
npm run dev:backend
npm run build:backend
npm test --workspace=backend

# Database lifecycle
npm run db:up        # start postgres + pgadmin
npm run db:down      # stop containers (keep volumes)
npm run db:reset     # destroy volumes and rebuild (DROPS ALL DATA)
npm run db:logs      # tail postgres logs

# Build both workspaces
npm run build
```

---

## Environment Variables

Each workspace owns its own `.env.example`. Copy and fill before running.

### Root `.env` (consumed by `docker-compose.yml` only)

| Variable              | Purpose                            | Default                      |
| --------------------- | ---------------------------------- | ---------------------------- |
| `DB_USER`             | Postgres superuser name            | `postgres`                   |
| `DB_PASS`             | Postgres superuser password        | `postgres`                   |
| `DB_PORT`             | Postgres host port                 | `5432`                       |
| `DB_NAME_DEVELOPMENT` | Development database name          | `indiamart_clone_dev`        |
| `DB_NAME_TEST`        | Test database name                 | `indiamart_clone_test`       |
| `PGADMIN_EMAIL`       | pgAdmin login email                | `admin@indiamart.local`      |
| `PGADMIN_PASSWORD`    | pgAdmin login password             | `admin`                      |
| `PGADMIN_PORT`        | pgAdmin host port                  | `5050`                       |

### `backend/.env`

| Variable                    | Purpose                                      | Required |
| --------------------------- | -------------------------------------------- | -------- |
| `NODE_ENV`                  | Runtime mode (`development` / `production`)  | Yes      |
| `PORT`                      | NestJS listen port (default `3001`)          | Yes      |
| `CLIENT_URL`                | Allowed CORS origin(s), comma-separated      | Yes      |
| `API_PREFIX`                | Global route prefix (default `api/v1`)       | No       |
| `DB_HOST`                   | Postgres host                                | Yes      |
| `DB_PORT`                   | Postgres port (default `5432`)               | Yes      |
| `DB_USER`                   | Postgres username                            | Yes      |
| `DB_PASS`                   | Postgres password                            | Yes      |
| `DB_NAME_DEVELOPMENT`       | Dev database name                            | Yes      |
| `DB_NAME_TEST`              | Test database name                           | No       |
| `DB_NAME_PRODUCTION`        | Production database name                     | Prod     |
| `DB_LOGGING`                | Log all SQL queries (`true` / `false`)       | No       |
| `DB_POOL_MAX`               | Sequelize pool max connections (default `5`) | No       |
| `DB_POOL_MIN`               | Sequelize pool min connections (default `0`) | No       |
| `JWT_SECRET`                | Access-token signing key (≥ 32 chars)        | Yes      |
| `JWT_REFRESH_SECRET`        | Refresh-token signing key (≥ 32 chars)       | Yes      |
| `JWT_EXPIRATION`            | Access token TTL (default `15m`)             | No       |
| `JWT_REFRESH_EXPIRATION`    | Refresh token TTL (default `7d`)             | No       |
| `AWS_S3_BUCKET`             | S3 bucket name (enables presigned uploads)   | No       |
| `AWS_S3_BUCKET_PUBLIC_URL`  | Public base URL for S3 objects               | No       |
| `AWS_REGION`                | AWS region (default `ap-south-1`)            | No       |
| `AWS_ACCESS_KEY_ID`         | AWS credentials                              | No       |
| `AWS_SECRET_ACCESS_KEY`     | AWS credentials                              | No       |
| `THROTTLE_TTL`              | Rate-limit window in ms (default `60000`)    | No       |
| `THROTTLE_LIMIT`            | Max requests per window (default `100`)      | No       |
| `SWAGGER_ENABLED`           | Enable Swagger UI (`true` / `false`)         | No       |
| `SWAGGER_PATH`              | Swagger UI path (default `api/docs`)         | No       |
| `ADMIN_EMAIL`               | Seed admin email                             | No       |
| `ADMIN_PASSWORD`            | Seed admin password                          | No       |
| `ADMIN_NAME`                | Seed admin display name                      | No       |

Backend env vars are validated by Joi on boot (`backend/src/config/validation.schema.ts`). Missing or invalid required vars cause an immediate, descriptive boot failure.

### `frontend/.env.local`

| Variable               | Purpose                              | Default                          |
| ---------------------- | ------------------------------------ | -------------------------------- |
| `NEXT_PUBLIC_API_URL`  | Backend base URL                     | `http://localhost:3001/api/v1`   |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL                   | `http://localhost:3000`          |
| `NEXT_PUBLIC_ENV`      | Environment label (`development` …)  | `development`                    |

---

## Frontend Route Map

The root path `/` renders a public marketing homepage. Authenticated users are silently redirected to `/me/dashboard` by the `<HomeAuthRedirect>` component. The buyer dashboard is the canonical landing surface for logged-in users.

| Group      | Path                                                                                                                                                                        | Who can access                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `(public)` | `/`, `/product/:slug`, `/category/:slug`, `/supplier/:slug`, `/search`, `/requirements`, `/requirements/new`                                                                | Public — no auth required             |
| `(auth)`   | `/login`, `/register`                                                                                                                                                       | Public — redirects if already logged in |
| `(buyer)`  | `/me/dashboard`, `/me/profile`, `/me/inquiries[/:id]`, `/me/saved`, `/me/requirements`, `/me/requirements/new`, `/me/know-your-seller`, `/me/faq`, `/me/ship`, `/me/search` | Any authenticated user                |
| `(seller)` | `/seller/dashboard`, `/seller/products[/:id/edit]`, `/seller/products/new`, `/seller/inquiries[/:id]`, `/seller/leads`, `/seller/profile`                                   | Seller + admin roles                  |
| `(admin)`  | `/admin/dashboard`, `/admin/users`, `/admin/sellers`, `/admin/products`, `/admin/categories`, `/admin/inquiries`                                                            | Admin only                            |

Route protection for authenticated areas is implemented in `frontend/src/features/auth/protected.tsx`, which reads auth status from Redux and redirects unauthorized users. Public routes have no protection wrapper.

---

## API Reference

All routes are prefixed `/api/v1/`. Swagger UI is available at `http://localhost:3001/api/docs` in non-production environments.

Paginated list endpoints accept `?page=&limit=&sort=&order=` and return a `PaginatedResult<T>` shape:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Auth

| Endpoint                          | Method | Auth           | Notes                                                                                    |
| --------------------------------- | ------ | -------------- | ---------------------------------------------------------------------------------------- |
| `/auth/register`                  | POST   | Public         | Buyer (default) or seller. Throttled 10/hour.                                            |
| `/auth/register-seller`           | POST   | Public         | **Deprecated.** One-shot seller signup. Prefer the upgrade flow.                         |
| `/auth/upgrade-to-seller`         | POST   | Bearer JWT     | Promote authenticated buyer to seller; collects business details. Rotates token pair.    |
| `/auth/login`                     | POST   | Public         | bcrypt-verified. Returns access token; sets refresh cookie. Throttled 5/min.             |
| `/auth/refresh`                   | POST   | Refresh cookie | Reads `refresh_token` httpOnly cookie; rotates both tokens.                              |
| `/auth/logout`                    | POST   | Public         | Clears the refresh cookie.                                                               |
| `/auth/me`                        | GET    | Bearer JWT     | Current user with linked profile.                                                        |

**Session model:**

- **Access token** — 15-minute JWT, returned in JSON, held in browser memory only (Redux + axios module). Never written to `localStorage`.
- **Refresh token** — 7-day JWT, sent as `httpOnly Secure SameSite=Lax` cookie. Rotated on every `/auth/refresh` and on `/auth/upgrade-to-seller`.
- All routes are protected by default (global `JwtAuthGuard`). Use `@Public()` to opt out and `@Roles(...)` to restrict by role.
- Every account is a buyer by default. The `seller` role is additive — sellers can browse, save, send inquiries, and post requirements just like buyers.

### Catalog

| Endpoint                                      | Method            | Auth          | Notes                                                          |
| --------------------------------------------- | ----------------- | ------------- | -------------------------------------------------------------- |
| `/categories`                                 | GET               | Public        | Full nested tree (top-level + sub-categories).                 |
| `/categories/:slug`                           | GET               | Public        | Get one category by slug.                                      |
| `/categories`                                 | POST              | Admin         | Create category; slug auto-generated.                          |
| `/categories/:id`                             | PATCH / DELETE    | Admin         | Update or soft-delete a category.                              |
| `/products`                                   | GET               | Public        | Paginated, filtered (`q` / `category` / `sellerId` / `price` / `stock`). |
| `/products/mine`                              | GET               | Seller        | Current seller's products (incl. inactive).                    |
| `/products/:slug`                             | GET               | Public        | Detail; increments `viewCount` (fire-and-forget).              |
| `/products`                                   | POST              | Seller        | Create; slug auto-generated; specs stored as JSONB.            |
| `/products/:id`                               | PATCH             | Seller (own)  | Update; ownership enforced (admin can edit any).               |
| `/products/:id`                               | DELETE            | Seller (own)  | Soft-delete.                                                   |
| `/products/:id/images`                        | POST              | Seller (own)  | Attach image record after upload (S3 or local).                |
| `/products/:productId/images/:imageId`        | DELETE            | Seller (own)  | Remove an image.                                               |

### Suppliers, Inquiries, Requirements, Saved, Search

| Endpoint                                                        | Method | Auth                   | Notes                                                                                  |
| --------------------------------------------------------------- | ------ | ---------------------- | -------------------------------------------------------------------------------------- |
| `/sellers`                                                      | GET    | Public                 | Paginated supplier directory; ordered by verified status + rating.                     |
| `/sellers/me`                                                   | GET    | Seller                 | Own profile.                                                                           |
| `/sellers/me`                                                   | PATCH  | Seller                 | Update own profile (slug is immutable).                                                |
| `/sellers/lookup?q=`                                            | GET    | Bearer JWT             | "Know Your Seller" partial-match lookup.                                               |
| `/sellers/:slug`                                                | GET    | Public                 | Public supplier profile + their active products.                                       |
| `/inquiries`                                                    | POST   | Any authenticated user | Send an inquiry to a supplier.                                                         |
| `/inquiries`                                                    | GET    | Bearer JWT             | Role-scoped list (buyer → sent, seller → received, admin → all).                       |
| `/inquiries/counts`                                             | GET    | Bearer JWT             | Unread counts (as buyer + as seller) for the navbar badge.                             |
| `/inquiries/:id`                                                | GET    | Participant or admin   | Inquiry detail + full message thread.                                                  |
| `/inquiries/:id/messages`                                       | POST   | Participant            | Reply on the thread.                                                                   |
| `/inquiries/:id/status`                                         | PATCH  | Seller / admin         | Transition status: `new` → `responded` → `closed`.                                    |
| `/requirements`                                                 | GET    | Public                 | Open buy-leads feed (paginated).                                                       |
| `/requirements/feed`                                            | GET    | Seller / admin         | Same as above but excludes the viewer's own posts.                                     |
| `/requirements/mine`                                            | GET    | Any authenticated user | Own posted requirements.                                                               |
| `/requirements/:id`                                             | GET    | Public                 | Get one requirement.                                                                   |
| `/requirements`                                                 | POST   | Any authenticated user | Post a new buy requirement.                                                            |
| `/requirements/:id/close`                                       | PATCH  | Owner                  | Close one of your own requirements.                                                    |
| `/requirements/:id/respond`                                     | POST   | Seller / admin         | Respond as a seller; atomically creates an inquiry with the buyer's context.           |
| `/saved-products`                                               | GET    | Any authenticated user | List saved products (full DTOs).                                                       |
| `/saved-products/ids`                                           | GET    | Any authenticated user | Just the saved product IDs (for heart-toggle state).                                   |
| `/saved-products`                                               | POST   | Any authenticated user | Save a product.                                                                        |
| `/saved-products/:productId`                                    | DELETE | Any authenticated user | Remove a product from the saved list.                                                  |
| `/search?q=&type=all\|products\|suppliers\|categories`          | GET    | Public                 | Unified search; `type=all` returns up to 8 of each type.                               |
| `/search/suggest?q=`                                            | GET    | Public                 | Lightweight autocomplete (up to 5 hits per type).                                      |

### Seller Dashboard & Admin

| Endpoint                                                        | Method       | Auth           | Notes                                                          |
| --------------------------------------------------------------- | ------------ | -------------- | -------------------------------------------------------------- |
| `/seller-dashboard/stats`                                       | GET          | Seller / admin | KPIs for the current seller.                                   |
| `/seller-dashboard/timeseries?days=30`                          | GET          | Seller / admin | Inquiries received per day (timeseries).                       |
| `/seller-dashboard/top-products?by=views\|inquiries&limit=5`    | GET          | Seller / admin | Top products by views or inquiries.                            |
| `/admin/stats`                                                  | GET          | Admin          | Global platform metrics.                                       |
| `/admin/users`                                                  | GET          | Admin          | Filterable list of all users (role / verified / q).            |
| `/admin/users/:id`                                              | PATCH/DELETE | Admin          | Update role + verification flag; soft-delete.                  |
| `/admin/sellers/:slug/verify`                                   | PATCH        | Admin          | Toggle a supplier's verified flag.                             |
| `/admin/products/:id/moderate`                                  | PATCH        | Admin          | Toggle a product's `isActive` (visible / hidden).              |

### Image Uploads

Call `GET /api/v1/uploads/status` to see which storage backend is active.

**S3 presigned PUT (preferred when AWS env vars are set):**

1. Browser calls `POST /uploads/presign` with `{ fileName, contentType, purpose }` → receives `{ uploadUrl, publicUrl, s3Key }`.
2. Browser `PUT`s the file body directly to `uploadUrl` with the matching `Content-Type`.
3. Browser calls `POST /products/:id/images` with `{ s3Key, url: publicUrl, isPrimary?, position? }`.

The server never proxies bytes. If `AWS_S3_BUCKET` is unset, the presign endpoint returns HTTP 503 with a hint to populate the AWS env vars or use the local fallback.

**Local-disk fallback (`POST /uploads/file`):**

1. Browser POSTs `multipart/form-data` to `/uploads/file` with the file under the `file` field and an optional `purpose`.
2. Backend stores the file under `backend/uploads/...` and serves it at `/uploads/...` via `@nestjs/serve-static`.
3. Browser calls `POST /products/:id/images` with the returned absolute `url`.

Max upload size and accepted MIME types (`image/jpeg|png|webp|gif`) are reported by `/uploads/status`.

---

## Default Seed Data

- **Admin user** — `admin@indiamart.local` / `ChangeMe@123` (override via `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` before seeding).
- **6 top-level categories** — Apparel & Fashion, Electronics & Electrical, Industrial Supplies, Building & Construction, Agriculture, Food & Beverages — each with 5 sub-categories.
- **`general` fallback category** — used by the multi-step seller signup when no explicit category is provided.

All seeders are idempotent (safe to re-run).

---

## Project Conventions

- **TypeScript strict mode** in both workspaces. No `any` without an explanatory comment.
- **Path aliases** declared in each workspace's `tsconfig.json` (e.g. `@/lib/axios`, `@/components/...`, `@/features/...`).
- **Commits** follow Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).
- **Migrations** are the single source of truth for the DB schema. Never call `Model.sync()`. Never mutate a committed migration — add a new one.
- **Ownership checks** live in services (`assertOwnerOrAdmin()`), not in guards, because the loaded entity is needed for comparison.
- **Fire-and-forget side effects** (e.g. view-count increment) are wrapped in `try/catch` and never `await`ed on the hot path.

---

## Troubleshooting

| Problem                                                   | Fix                                                                                                  |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Backend boot fails with Joi error                         | Copy `backend/.env.example` → `backend/.env` and fill `JWT_SECRET` / `JWT_REFRESH_SECRET` (≥ 32 chars). |
| `docker compose up` says port 5432 already in use         | A native Postgres is running. Stop it, or change `DB_PORT` in `.env`.                               |
| Frontend can't reach backend                              | Confirm backend is on port 3001 and `NEXT_PUBLIC_API_URL` matches. CORS allows `CLIENT_URL` only.    |
| `npm install` fails on Windows due to long paths          | Run `git config --system core.longpaths true` and re-install.                                        |
| `/uploads/presign` returns 503                            | `AWS_S3_BUCKET` is unset. Fill the AWS env vars, or use `POST /uploads/file` (local fallback).       |
| Migrations fail with "relation already exists"            | The DB has a partial schema. Run `npm run migrate:undo:all` then `npm run migrate` to reset cleanly. |
| Seeder fails with unique constraint                       | Seeders are idempotent — re-running is safe. If it still fails, check for stale data with a different email. |
| Frontend shows blank page after login                     | Check browser console for 401 errors. The refresh cookie may be missing — log out and log back in.   |
