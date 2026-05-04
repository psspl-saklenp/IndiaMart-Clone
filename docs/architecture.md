# Architecture Overview
This document describes the architecture of the **indiamart-clone** B2B marketplace as it stands today.
## Monorepo Layout
```
indiamart-clone/
├── frontend/          # Next.js 15 (App Router) + React 19 + Tailwind v4
├── backend/           # NestJS 11 + Sequelize-TypeScript + PostgreSQL
├── docker/            # Container init scripts (Postgres bootstrap)
├── docs/              # Architecture docs
├── .github/workflows/ # CI (lint + build + tests, both workspaces)
└── docker-compose.yml # Local Postgres + pgAdmin
```
Workspaces are managed by **npm workspaces**. No Turborepo for now; revisit if CI build times exceed 5 minutes.
## Frontend
### Routing model
The App Router is sliced into four route groups, each with its own layout and protection rules. The root path `/` redirects to `/me/dashboard`, so the buyer experience is the canonical landing surface.
- `(auth)` — `/login`, `/register`. Public.
- `(buyer)` — open to **buyer + seller + admin**. Hosts the buyer dashboard, browse/search, supplier and product detail pages, the inquiry inbox, saved products, and the buyer's posted requirements. Sellers and admins see this surface too because every account is a buyer by default.
- `(seller)` — open to **seller + admin**. Hosts the seller's KPI dashboard, product CRUD UI, inquiries inbox, buy-leads (requirements feed), and seller business profile.
- `(admin)` — open to **admin** only. Hosts platform stats, user moderation, supplier verification, product moderation, and category CRUD.
Route protection is implemented client-side by `frontend/src/features/auth/protected.tsx`, which reads the auth status from Redux and redirects unauthenticated/unauthorized users.
### State and data
- **TanStack Query v5** for all server state (products, inquiries, requirements, saved, search, sellers, dashboards). Caching, background refetch, and mutation invalidation are handled by Query.
- **Redux Toolkit** strictly for cross-cutting client state:
  - `auth` slice: current user, status (`idle | loading | authenticated | unauthenticated | error`), thunks for `login`, `register`, `registerSeller` (deprecated), `upgradeToSeller`, `hydrate`, `logout`. The auth bootstrap component dispatches `hydrate` once at app start and lets the axios refresh interceptor transparently rotate tokens via the httpOnly cookie.
  - `ui` slice: cross-component UI state (e.g. the seller signup modal which any "Sell" button can dispatch open).
- **Styling**: **Tailwind CSS v4** using the new CSS-first config (`@import "tailwindcss"` + `@theme` in `globals.css`). No PostCSS plugins beyond `@tailwindcss/postcss`.
- **Data fetching**: a single Axios instance at `frontend/src/lib/axios.ts`. Access token in module memory (Redux holds the user, axios holds the token); refresh handled by an interceptor that detects 401s, attempts a single refresh, dedupes concurrent refreshes via a shared in-flight promise, and short-circuits when the failing call is itself `/auth/refresh` (avoiding a CORS-preflight loop).
### Feature-sliced modules
Each subfolder under `frontend/src/features/` owns its UI components, hooks, API client wrappers, and Query keys for one product surface: `admin/`, `auth/`, `buyer/`, `categories/`, `dashboard/` (seller dashboard), `inquiries/`, `products/`, `requirements/`, `saved/`, `search/`, `seller/` (catalog editor), `sellers/`, `uploads/`. Shared layout/UI primitives live in `frontend/src/components/{layout,ui,product,supplier,charts,system}`.
## Backend
### Module map
`backend/src/app.module.ts` wires global config + throttling + the database module + the following domain modules:
- `health` — liveness and DB-readiness endpoints (cross-cutting).
- `users` — User, BuyerProfile, SellerProfile models. Internal services consumed by other modules.
- `auth` — register / login / refresh / logout / me, plus the buyer→seller upgrade and the deprecated one-shot seller registration. Uses two distinct JWT secrets and rotates the refresh cookie on every refresh and on role change.
- `categories` — public tree + slug lookup; admin CRUD.
- `products` — listing with filters, public detail (with view-count increment), `mine` for sellers, full CRUD with ownership checks, image attach/detach.
- `sellers` — public supplier directory, public profile by slug, "Know Your Seller" lookup, `me` profile read/update.
- `inquiries` — create, role-scoped list, detail+thread, reply, status update, plus an unread-counts endpoint for the navbar badge. Backed by `Inquiry` and `InquiryMessage` models.
- `requirements` — buy-leads: public list + detail, `feed` for sellers (excludes own posts), `mine` for buyers, create, close, and a seller `respond` action that spins up a related inquiry.
- `saved-products` — buyer wishlist (full list, ids-only list, save, unsave). Open to every authenticated user.
- `search` — unified search across products, suppliers, and categories (`type=all|products|suppliers|categories`) plus a lightweight autocomplete suggester.
- `seller-dashboard` — KPIs, daily inquiries timeseries, and top products by views or inquiries.
- `admin` — platform stats, user list/update/delete, supplier verification toggle, product moderation toggle.
- `uploads` — S3 presigned-PUT URLs and a local-disk multipart fallback. A public `/status` endpoint reports which backend is active.
### Cross-cutting
- **Configuration**: `@nestjs/config` with **Joi** validation (`backend/src/config/validation.schema.ts`) — required env vars cause boot to fail fast; AWS vars are optional and validated lazily at the upload service.
- **Database**: `@nestjs/sequelize` with `sequelize-typescript`. `synchronize: false` — migrations are the single source of truth. `paranoid: true` and `underscored: true` are global defaults. Pool sizes come from env. Migrations + seeders run via `sequelize-cli`.
- **Global guards** (in order): `ThrottlerGuard` → `JwtAuthGuard` → `RolesGuard`. Endpoints opt out of auth with `@Public()` and restrict by role with `@Roles(UserRole.X)`.
- **Validation**: global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`, implicit-conversion enabled. DTOs use `class-validator` + `class-transformer`.
- **Security & perf middleware**: `helmet` (with `crossOriginResourcePolicy: cross-origin` so the Next.js dev server can embed `/uploads/*`), `compression`, `cookie-parser`, CORS limited to the configured `CLIENT_URL` (comma-separated allowed).
- **API surface**: `/api/v1/*`. Pagination uses `?page=&limit=&sort=&order=` with a shared `PaginatedResult<T>` shape.
- **Rate limiting**: `@nestjs/throttler` with global defaults from env (`THROTTLE_TTL`, `THROTTLE_LIMIT`). Auth endpoints get tighter per-route overrides via `@Throttle(...)` (e.g. login is 5/min, register is 10/hour).
- **Docs**: Swagger/OpenAPI is auto-generated and served at `/api/docs` in non-production environments only.
- **Graceful shutdown**: `app.enableShutdownHooks()` on bootstrap.
## Data Layer
PostgreSQL 16 with `uuid-ossp`, `pg_trgm`, and `unaccent` extensions enabled at init. All tables use UUID primary keys; `created_at` / `updated_at` are required, `deleted_at` is added to every paranoid table.
The migrations under `backend/src/database/migrations` (in order) own the schema:
- `0001-create-users` — `users` (email unique, role enum `buyer|seller|admin`, bcrypt password hash, paranoid).
- `0002-create-buyer-profiles` — buyer profile (1:1 with user).
- `0003-create-seller-profiles` — seller profile (1:1 with user; company name, slug, GST, ratings, verification flag).
- `0004-create-categories` — nested categories (`parent_id`, `slug` unique).
- `0005-create-products` — products with FK seller + category, slug unique, price/min-order/unit, stock-status enum, JSONB specifications, view/inquiry counters. Trigram GIN index on `name` (`pg_trgm`) for fuzzy `ILIKE` listing/search.
- `0006-create-product-images` — product images with `is_primary`, `position`, `s3_key`, `url`.
- `0007-backfill-seller-slugs` — backfills `seller_profiles.slug` for rows created before the field was set during registration.
- `0008-create-inquiries` — inquiry header (buyer, seller, optional product, subject, message, quantity/unit/expected_price, status enum `new|responded|closed`, last-read timestamps for each side).
- `0009-create-inquiry-messages` — threaded messages on an inquiry, with optional JSONB attachments.
- `0010-create-saved-products` — buyer wishlist (`(buyer_id, product_id)` unique).
- `0011-create-requirements` — buy-leads (buyer, category, title, description, quantity/unit/expected_price, location_city, status enum `open|closed`, response_count).
- `0012-add-seller-profile-extras` — adds `city`, `pincode`, `pan_number` to `seller_profiles` (collected by the multi-step seller signup modal).
Seeders (`backend/src/database/seeders`):
- `0001-admin-user` — idempotent default admin (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`).
- `0002-categories` — six top-level categories with five sub-categories each, idempotent by slug.
- `0003-general-category` — a `general` fallback category used by the multi-step seller signup when no explicit category is provided.
## Auth subsystem
- Global `JwtAuthGuard` registered as `APP_GUARD`; `@Public()` opts a route out.
- Global `RolesGuard` evaluates `@Roles(...)` metadata against the authenticated `req.user`.
- Two distinct JWT secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`) so leaking one does not compromise the other.
- Access token: 15-minute lifetime, returned in JSON, held in browser memory only. Never written to `localStorage`.
- Refresh token: 7-day lifetime, sent as `httpOnly` `Secure` (in production) `SameSite=Lax` cookie. Rotated on every successful `/auth/refresh` and on `/auth/upgrade-to-seller`.
- `bcrypt` rounds = 12 (constant in `auth.service.ts`).
- The frontend stays logged in across page reloads via a single `/auth/me` call: the access token in memory is gone after a reload, so the request goes out with no bearer and the backend replies 401. The shared axios response interceptor then transparently rotates the refresh-token cookie via `/auth/refresh`, stashes the fresh access token, and retries `/auth/me`.
- Buyer→seller upgrade (`POST /auth/upgrade-to-seller`) collects business details + initial catalog and re-issues a token pair so subsequent requests carry the `seller` role claim.
- Admin seeder is idempotent.
## Catalog subsystem
- Slugs are generated server-side from `name` via `slugify` and made unique with a small retry loop, falling back to a random 6-char suffix.
- Trigram index (`pg_trgm`) on `products.name` lets fuzzy `ILIKE` search land cheaply; the unified `/search` endpoint reuses the same index.
- Ownership is enforced inside `ProductsService.assertOwnerOrAdmin(...)` rather than in a guard, because we need access to the loaded entity to compare `sellerId`.
- `view_count` is incremented in a fire-and-forget call so a counter failure never breaks a product detail request.
## Inquiries & requirements
- Every authenticated user can send inquiries and post requirements — the `seller` role is purely additive on top of buyer capabilities.
- Inquiry list endpoints are role-scoped: buyers see what they sent, sellers see what they received, admins see everything.
- Per-side `last_read_at` timestamps power the unread-counts endpoint that the navbar badge polls.
- Sellers respond to a buy-lead via `POST /requirements/:id/respond`, which atomically creates an inquiry between the buyer and the seller carrying the buyer's requirement context (subject + message).
## Search
- `/search` is unified: when `type=all` (default) it returns up to 8 products + 8 suppliers + 8 categories. When `type=products|suppliers` it returns a paginated block of just that type. When `type=categories` it returns a flat list.
- `/search/suggest` is a lightweight autocomplete returning up to 5 hits of each type for navbar dropdowns.
## Uploads
The backend supports two interchangeable image-upload backends, reported by `GET /uploads/status`:
- **S3 presigned PUT**: `POST /uploads/presign` returns `{ uploadUrl, publicUrl, s3Key }` (5-minute expiry). The browser uploads directly to S3 — the backend never proxies bytes — then attaches the metadata via `POST /products/:id/images`. If `AWS_S3_BUCKET` is unset the presign endpoint returns 503 with operator guidance.
- **Local-disk fallback**: `POST /uploads/file` (multipart) saves the file under `backend/uploads/<purpose>/...` and serves it back at `/uploads/...` via `@nestjs/serve-static`. Same product-image attach flow afterwards.
Max upload size and accepted MIME types (`image/jpeg|png|webp|gif`) are constants in `uploads.constants.ts` and are echoed by `/uploads/status`.
## Deployment Targets
- **Frontend** → Vercel.
- **Backend** → Render or Fly.io (Dockerfile pending).
- **Database** → Render Postgres or Neon.
- **Object storage** → AWS S3 in production. Local-disk fallback exists for environments where S3 isn't yet provisioned.
## CI
GitHub Actions (`.github/workflows/ci.yml`) runs on `push`/`pull_request` against `main` and `develop`:
- `lint-and-build` — matrix over `frontend` + `backend`: `npm ci`, lint, build (with placeholder env vars).
- `test-backend` — spins up a Postgres 16 service, runs Jest in `backend`.
- `test-frontend` — runs Vitest in `frontend`.
