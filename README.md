# indiamart-clone

A production-quality B2B marketplace web portal inspired by IndiaMART.

> **Status:** end-to-end marketplace flows are live — auth (with buyer→seller upgrade), full catalog (categories, products, images), supplier directory + public profiles, unified search, inquiries with threaded messaging, buy-leads (requirements), wishlist (saved products), seller KPI dashboard, and an admin console. Image uploads support both AWS S3 (presigned PUT) and a local-disk fallback for environments without S3 configured. See [`docs/architecture.md`](docs/architecture.md) for the architecture overview.

## Tech stack

| Layer        | Choice                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| Frontend     | Next.js 15 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS v4 |
| State        | Redux Toolkit (auth + UI state), TanStack Query v5 (server state)      |
| Backend      | NestJS 11, TypeScript 5, Sequelize-TypeScript, Joi config validation   |
| Database     | PostgreSQL 16 (`uuid-ossp`, `pg_trgm`, `unaccent`)                     |
| Auth         | JWT access (15m, in-memory) + refresh (7d, httpOnly cookie), bcrypt    |
| Object store | AWS S3 via presigned PUT URLs **or** local-disk fallback (`uploads/`)  |
| Tooling      | npm workspaces, ESLint, Prettier, Docker Compose, GitHub Actions       |

## Repository layout

```
indiamart-clone/
├── backend/                NestJS API (port 3001)
├── frontend/               Next.js app (port 3000)
├── docker/                 Container init scripts (Postgres bootstrap SQL)
├── docs/                   Architecture docs
├── .github/workflows/      CI (lint + build + tests, both workspaces)
├── docker-compose.yml      Local Postgres 16 + pgAdmin
└── package.json            npm workspaces root
```

## Prerequisites

| Tool           | Version       | Notes                                                      |
| -------------- | ------------- | ---------------------------------------------------------- |
| Node.js        | `>= 20.10.0`  | Pin via `.nvmrc`. Windows: install via `nvm-windows` or `winget install OpenJS.NodeJS`. |
| npm            | `>= 10`       | Ships with Node 20.                                        |
| Docker Desktop | latest        | Required to run Postgres locally via `docker-compose.yml`. |
| Git            | any recent    |                                                            |

Optional: a Postgres GUI (pgAdmin is auto-launched at <http://localhost:5050>).

## First-time setup

```pwsh
# 1) From repo root, copy env templates
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local

# 2) Install dependencies for both workspaces
npm install

# 3) Start Postgres + pgAdmin (Docker Desktop must be running)
npm run db:up

# 4) Verify Postgres is healthy
docker compose ps
```

> **Windows / PowerShell tip.** If `npm install` is slow due to antivirus scanning `node_modules`, exclude `G:\indiamart-clone\**\node_modules` from real-time scanning.

## Database setup

After `db:up` is healthy, run the migrations and seeders:

```pwsh
npm run migrate          # creates all tables (users, profiles, categories, products, images, inquiries, messages, saved_products, requirements, …)
npm run seed             # creates the default admin + the IndiaMART-style category tree + the General fallback category
```

Default admin credentials (override via `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` env vars before seeding):

- Email: `admin@indiamart.local`
- Password: `ChangeMe@123`

**Rotate these before any non-local deployment.**

Useful related commands:

```pwsh
npm run migrate:undo     # rollback last migration
npm run migrate:undo:all # rollback all migrations
npm run seed:undo:all    # remove all seeded rows
```

## Run the dev servers

In two separate shells (or run only the one you need):

```pwsh
# Backend (NestJS, watch mode) → http://localhost:3001
npm run dev:backend

# Frontend (Next.js + Turbopack) → http://localhost:3000
npm run dev:frontend
```

### Smoke checks

| Check               | URL                                              | Expected                                              |
| ------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| Backend liveness    | <http://localhost:3001/api/v1/health>            | `{ "status": "ok", ... }`                             |
| Backend DB readiness| <http://localhost:3001/api/v1/health/db>         | `{ "database": { "connected": true, ... } }`          |
| Swagger / OpenAPI   | <http://localhost:3001/api/docs>                 | Swagger UI (non-production only)                      |
| Upload backend      | <http://localhost:3001/api/v1/uploads/status>    | `{ "storage": "s3" \| "local", ... }`                 |
| Frontend home       | <http://localhost:3000>                          | Redirects to `/me/dashboard` (login if logged out)    |
| Login page          | <http://localhost:3000/login>                    | Centered card; works against the seeded admin         |
| Register page       | <http://localhost:3000/register>                 | Buyer signup + seller upgrade modal entry point       |

## Useful commands

```pwsh
# Lint everything
npm run lint

# Run all tests across workspaces (backend: Jest; frontend: Vitest)
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
```

Migrations and seeders are wired through `sequelize-cli` and exposed via npm aliases (`migrate`, `migrate:undo`, `migrate:undo:all`, `seed`, `seed:undo:all`).

## Environment variables

Each workspace owns its own `.env.example`:

- **`./.env`** — only consumed by `docker-compose.yml` (DB credentials, pgAdmin login).
- **`backend/.env`** — backend runtime (port, DB connection, JWT secrets, AWS placeholders, throttling, Swagger toggle).
- **`frontend/.env.local`** — frontend public vars (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ENV`).

Backend env vars are validated by Joi on boot (`backend/src/config/validation.schema.ts`); missing/invalid values fail fast with a clear error.

## Project conventions

- TypeScript strict mode in both workspaces.
- Path aliases declared in each workspace's `tsconfig.json` (e.g. `@/lib/axios`, `@/components/...`, `@/features/...`).
- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, …).
- All git operations require explicit approval (per project rule); we never `git push`.

## Troubleshooting

| Problem                                                  | Fix                                                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Backend boot fails with Joi error                        | Copy `backend/.env.example` → `backend/.env` and fill `JWT_SECRET` / `JWT_REFRESH_SECRET` (≥16 chars). |
| `docker compose up` says port 5432 already in use        | A native Postgres is running. Stop it, or change `DB_PORT` in `.env`.                              |
| Frontend can't reach backend                             | Confirm backend is on port 3001 and `NEXT_PUBLIC_API_URL` matches. CORS allows `CLIENT_URL` only.   |
| `npm install` fails on Windows due to long paths         | Run `git config --system core.longpaths true` and re-install.                                      |
| `/uploads/presign` returns 503                           | `AWS_S3_BUCKET` is unset. Either fill the AWS env vars, or use `POST /uploads/file` (local fallback). |

## Frontend route map

The root path `/` redirects to `/me/dashboard`. The buyer experience is the default for every authenticated user; sellers and admins jump into their own areas explicitly.

| Group     | Path                              | Who can see it                       |
| --------- | --------------------------------- | ------------------------------------ |
| `(auth)`  | `/login`, `/register`             | Public                               |
| `(buyer)` | `/me/dashboard`, `/me/profile`, `/me/inquiries[/:id]`, `/me/saved`, `/me/requirements`, `/me/know-your-seller`, `/me/faq`, `/me/ship`, `/category/:slug`, `/product/:slug`, `/supplier/:slug`, `/search`, `/requirements/new` | Buyer + seller + admin (every authenticated user) |
| `(seller)`| `/seller/dashboard`, `/seller/products[/:id/edit]`, `/seller/products/new`, `/seller/inquiries[/:id]`, `/seller/leads`, `/seller/profile` | Seller + admin                       |
| `(admin)` | `/admin/dashboard`, `/admin/users`, `/admin/sellers`, `/admin/products`, `/admin/categories`, `/admin/inquiries` | Admin                                |

## Auth at a glance

| Endpoint                       | Method | Auth        | Notes                                                                   |
| ------------------------------ | ------ | ----------- | ----------------------------------------------------------------------- |
| `/api/v1/auth/register`        | POST   | Public      | Buyer (default) or seller. Throttled 10/hour.                            |
| `/api/v1/auth/register-seller` | POST   | Public      | **Deprecated.** One-shot seller signup. Throttled 10/hour. Prefer the upgrade flow. |
| `/api/v1/auth/upgrade-to-seller` | POST | Bearer JWT  | Promote authenticated buyer to seller; collects business details + initial catalog. Rotates token pair. |
| `/api/v1/auth/login`           | POST   | Public      | bcrypt-verified. Returns access token; sets refresh cookie. 5/min.       |
| `/api/v1/auth/refresh`         | POST   | Refresh cookie | Reads `refresh_token` httpOnly cookie; rotates both tokens.            |
| `/api/v1/auth/logout`          | POST   | Public      | Clears the refresh cookie.                                              |
| `/api/v1/auth/me`              | GET    | Bearer JWT  | Current user with linked profile.                                       |

Session model:

- **Access token**: JWT, 15-minute lifetime, returned in JSON, held in browser memory only (Redux + axios module). Never written to `localStorage`.
- **Refresh token**: JWT, 7-day lifetime, sent as `httpOnly` `Secure` (in production) `SameSite=Lax` cookie. Rotated on every `/auth/refresh` and on `/auth/upgrade-to-seller`.
- All routes are protected by default (global `JwtAuthGuard`). Use `@Public()` to opt out and `@Roles(...)` plus `RolesGuard` to restrict by role.
- Every account is a buyer by default. The `seller` role is additive on top of buyer capabilities — sellers can browse, save, send inquiries, and post requirements just like buyers.

## Catalog at a glance

| Endpoint                                      | Method | Auth          | Notes                                                              |
| --------------------------------------------- | ------ | ------------- | ------------------------------------------------------------------ |
| `/api/v1/categories`                          | GET    | Public        | Full nested tree (top-level + sub-categories).                     |
| `/api/v1/categories/:slug`                    | GET    | Public        | Get one category by slug.                                          |
| `/api/v1/categories`, `/:id`                  | POST/PATCH/DELETE | Admin | CRUD; auto slug; admin-only.                                       |
| `/api/v1/products`                            | GET    | Public        | Paginated, filtered (q / category / sellerId / price / stock).     |
| `/api/v1/products/mine`                       | GET    | Seller        | List the current seller's products (incl. inactive).               |
| `/api/v1/products/:slug`                      | GET    | Public        | Detail; increments `viewCount` (fire-and-forget).                  |
| `/api/v1/products`                            | POST   | Seller        | Create; slug auto-generated; specs JSONB.                          |
| `/api/v1/products/:id`                        | PATCH  | Seller (own)  | Update; ownership enforced (admin can edit any).                   |
| `/api/v1/products/:id`                        | DELETE | Seller (own)  | Soft-delete.                                                       |
| `/api/v1/products/:id/images`                 | POST   | Seller (own)  | Attach image record after upload (S3 or local).                    |
| `/api/v1/products/:productId/images/:imageId` | DELETE | Seller (own)  | Remove an image.                                                   |

## Suppliers, inquiries, requirements, saved, search

| Endpoint                                            | Method | Auth                     | Notes                                                              |
| --------------------------------------------------- | ------ | ------------------------ | ------------------------------------------------------------------ |
| `/api/v1/sellers`                                   | GET    | Public                   | Paginated supplier directory; ordered by verified status + rating. |
| `/api/v1/sellers/me`                                | GET/PATCH | Seller                | Own profile (slug is immutable).                                   |
| `/api/v1/sellers/lookup?q=…`                        | GET    | Bearer JWT               | "Know Your Seller" partial-match lookup.                           |
| `/api/v1/sellers/:slug`                             | GET    | Public                   | Public supplier profile + their active products.                   |
| `/api/v1/inquiries`                                 | POST   | Any authenticated user   | Send an inquiry to a supplier.                                     |
| `/api/v1/inquiries`                                 | GET    | Bearer JWT               | Role-scoped list (buyer→sent, seller→received, admin→all).         |
| `/api/v1/inquiries/counts`                          | GET    | Bearer JWT               | Unread counts (as buyer + as seller) for the navbar badge.         |
| `/api/v1/inquiries/:id`                             | GET    | Participant or admin     | Inquiry detail + thread.                                           |
| `/api/v1/inquiries/:id/messages`                    | POST   | Participant              | Reply on the thread.                                               |
| `/api/v1/inquiries/:id/status`                      | PATCH  | Seller / admin           | `new` → `responded` → `closed`.                                    |
| `/api/v1/requirements`                              | GET    | Public                   | Open buy-leads feed (paginated).                                   |
| `/api/v1/requirements/feed`                         | GET    | Seller / admin           | Same as above but excludes the viewer's own posts.                 |
| `/api/v1/requirements/mine`                         | GET    | Any authenticated user   | Own posted requirements.                                           |
| `/api/v1/requirements/:id`                          | GET    | Public                   | Get one requirement.                                               |
| `/api/v1/requirements`                              | POST   | Any authenticated user   | Post a new buy requirement.                                        |
| `/api/v1/requirements/:id/close`                    | PATCH  | Owner                    | Close one of your own requirements.                                |
| `/api/v1/requirements/:id/respond`                  | POST   | Seller / admin           | Respond as a seller; creates an inquiry with the buyer's context.  |
| `/api/v1/saved-products`                            | GET    | Any authenticated user   | List saved products (full DTOs).                                   |
| `/api/v1/saved-products/ids`                        | GET    | Any authenticated user   | Just the saved product ids (for heart toggles).                    |
| `/api/v1/saved-products`                            | POST   | Any authenticated user   | Save a product.                                                    |
| `/api/v1/saved-products/:productId`                 | DELETE | Any authenticated user   | Remove a product from the saved list.                              |
| `/api/v1/search?q=…&type=all\|products\|suppliers\|categories` | GET | Public        | Unified search; `type=all` returns up to 8 of each.                |
| `/api/v1/search/suggest?q=…`                        | GET    | Public                   | Lightweight autocomplete (up to 5 hits per type).                  |

## Seller dashboard & admin

| Endpoint                                       | Method | Auth           | Notes                                                              |
| ---------------------------------------------- | ------ | -------------- | ------------------------------------------------------------------ |
| `/api/v1/seller-dashboard/stats`               | GET    | Seller / admin | KPIs for the current seller.                                       |
| `/api/v1/seller-dashboard/timeseries?days=30`  | GET    | Seller / admin | Inquiries received per day.                                        |
| `/api/v1/seller-dashboard/top-products?by=views\|inquiries&limit=5` | GET | Seller / admin | Top products. |
| `/api/v1/admin/stats`                          | GET    | Admin          | Global platform metrics.                                           |
| `/api/v1/admin/users`                          | GET    | Admin          | Filterable list of all users (role / verified / q).                |
| `/api/v1/admin/users/:id`                      | PATCH/DELETE | Admin    | Update role + verification flag; soft-delete.                      |
| `/api/v1/admin/sellers/:slug/verify`           | PATCH  | Admin          | Toggle a supplier's verified flag.                                 |
| `/api/v1/admin/products/:id/moderate`          | PATCH  | Admin          | Toggle a product's `isActive` (visible/hidden).                    |

## Image uploads

The backend supports two interchangeable storage backends. Call `GET /api/v1/uploads/status` to see which is currently active.

### S3 presigned PUT (preferred when AWS env vars are populated)

1. Browser calls `POST /uploads/presign` with `{ fileName, contentType, purpose }` and gets back `{ uploadUrl, publicUrl, s3Key }`.
2. Browser `PUT`s the file body directly to `uploadUrl` with the matching `Content-Type`.
3. Browser calls `POST /products/:id/images` with `{ s3Key, url: publicUrl, isPrimary?, position? }` to record the image on the product.

The server never proxies bytes — scales independent of upload size. If `AWS_S3_BUCKET` is unset the presign endpoint returns HTTP 503 with a human-readable hint to populate the AWS env vars (or to use the local fallback below).

### Local-disk fallback (`POST /uploads/file`)

For environments without AWS configured (or for quick local development):

1. Browser POSTs `multipart/form-data` to `/uploads/file` with the file under the `file` field and an optional `purpose`.
2. The backend stores the file under `backend/uploads/...` and serves it back at `/uploads/...` (mounted via `@nestjs/serve-static`).
3. Browser calls `POST /products/:id/images` with the returned absolute `url`.

Max upload size and accepted MIME types (`image/jpeg|png|webp|gif`) are reported by `/uploads/status`.

## Default seed data

- 6 top-level categories (Apparel & Fashion, Electronics & Electrical, Industrial Supplies, Building & Construction, Agriculture, Food & Beverages) with 5 sub-categories each.
- A `general` fallback category used by the multi-step seller signup when the seller doesn't explicitly assign one.
- Admin user (`admin@indiamart.local` / `ChangeMe@123`) for catalog and platform moderation.
