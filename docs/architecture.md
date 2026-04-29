# Architecture Overview

This document describes the high-level architecture for the **indiamart-clone** B2B marketplace.

## Monorepo Layout

```
indiamart-clone/
├── frontend/          # Next.js 15 (App Router) + React 19 + Tailwind v4
├── backend/           # NestJS 11 + Sequelize-TypeScript + PostgreSQL
├── docker/            # Container init scripts
├── docs/              # Living architectural docs
├── .github/workflows/ # CI/CD
└── docker-compose.yml # Local Postgres + pgAdmin
```

Workspaces are managed by **npm workspaces**. No Turborepo for now; revisit if CI build times exceed 5 minutes.

## Frontend

- **Next.js 15 App Router**: server components for SEO-critical pages (home, product detail, supplier profile, search results); client components only where interactivity is required (forms, dashboards).
- **State management**:
  - **TanStack Query v5** for all server state (products, inquiries, search results). Caching, background refetch, mutation invalidation are all handled by Query.
  - **Redux Toolkit** strictly for cross-cutting client state: authenticated user, UI prefs, compare-list. Slices live under `src/store/slices/`.
- **Styling**: **Tailwind CSS v4** using the new CSS-first config (`@import "tailwindcss"` + `@theme` in `globals.css`). No PostCSS plugins beyond `@tailwindcss/postcss`.
- **Data fetching**: Axios instance with interceptors at `src/lib/axios.ts`. Access token in memory (Redux); refresh token via httpOnly cookie set by backend.
- **Route groups**:
  - `(public)` — anonymous users (home, listings, product details, search)
  - `(auth)` — login/register/forgot-password
  - `(buyer)`, `(seller)`, `(admin)` — role-protected via Next.js middleware + server-side auth checks

## Backend

- **NestJS 11** modular structure under `src/modules/<feature>/`. Each module exports a controller, a service, DTOs, and (when applicable) Sequelize models.
- **Common cross-cutting** code under `src/common/` (guards, interceptors, decorators, filters, pipes, base DTOs).
- **Configuration**: `@nestjs/config` with **Joi** validation. Required env vars cause boot to fail fast — no silent missing-config bugs.
- **Database**: `@nestjs/sequelize` with `sequelize-typescript`. Migrations + seeders live under `src/database/{migrations,seeders}` and run via `sequelize-cli`.
- **Auth (Phase 2)**: JWT access (15m) + refresh (7d, httpOnly cookie). bcrypt for passwords. `JwtAuthGuard` + `RolesGuard` with `@Roles('seller')` decorator.
- **API surface**: `/api/v1/*`. Standard envelope `{ data, meta?, error? }`. Pagination `?page=&limit=&sort=&order=`.
- **Validation**: global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`. DTOs use `class-validator` + `class-transformer`.
- **Security**: `helmet`, `cors`, `cookie-parser`, `compression`, `@nestjs/throttler` rate-limiting (auth & inquiry endpoints get tighter limits).
- **Docs**: Swagger/OpenAPI auto-generated, served at `/api/docs` in non-production environments.

## Data Layer

- PostgreSQL 16 with `uuid-ossp`, `pg_trgm`, and `unaccent` extensions enabled at init.
- All tables use UUID primary keys, `created_at` / `updated_at` / `deleted_at` (paranoid soft delete).
- See `docs/db-schema.md` (added in Phase 2) for full schema.

## Deployment Targets

- **Frontend** → Vercel
- **Backend** → Render or Fly.io (Dockerfile to be added in Phase 9)
- **Database** → Render Postgres or Neon
- **Object storage** → AWS S3 (Phase 3); presigned-URL upload pattern (browser uploads directly to S3, backend never proxies bytes).

## Phased Delivery

Phases 1–9 are tracked in the implementation plan.

- **Phase 1 (done)** — monorepo, skeletons, configs, env, health check, CI.
- **Phase 2 (done)** — auth: `users`, `buyer_profiles`, `seller_profiles` tables; JWT access + refresh; bcrypt; role guards; admin seeder; login/register UI.
- **Phase 3 (done)** — catalog: `categories` (nested tree, seeded), `products`, `product_images`; S3 presigned-URL upload; public listing+detail pages; seller CRUD UI.
- **Phase 4 (next)** — IndiaMART-style public homepage clone: hero, mega-menu, featured suppliers, trending products, footer; refined product listing.
- Phases 5–9 unchanged from the implementation plan.

## Auth subsystem (Phase 2)

- Global `JwtAuthGuard` registered as `APP_GUARD`; `@Public()` opts a route out.
- Global `RolesGuard` evaluates `@Roles(...)` metadata against the authenticated `req.user`.
- Two distinct JWT secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`) so leaking one does not compromise the other.
- Refresh tokens rotate on every successful refresh; future enhancement (Phase 9) adds a server-side store with reuse detection.
- bcrypt rounds = 12 (configurable via constant in `auth.service.ts`).
- Admin seeder is idempotent (`ADMIN_EMAIL` / `ADMIN_PASSWORD` env overrides).

## Catalog subsystem (Phase 3)

- Slugs are generated server-side from `name` via `slugify` and made unique with a small retry loop, falling back to a random 6-char suffix.
- Trigram index (`pg_trgm`) on `products.name` lets fuzzy search land cheaply in Phase 5; for Phase 3 the listing endpoint just uses `ILIKE`.
- Ownership is enforced inside `ProductsService.assertOwnerOrAdmin(...)` rather than in a guard, because we need access to the loaded entity to compare `sellerId`.
- `view_count` is incremented in a fire-and-forget call so a counter failure never breaks a product detail request.
- Image upload uses presigned PUT URLs (5-minute expiry). The browser uploads directly to S3 — the backend never proxies bytes — then calls `POST /products/:id/images` to record the metadata. When `AWS_S3_BUCKET` is unset the presign endpoint returns 503 with operator guidance.
