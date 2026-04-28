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

Phases 1–9 are tracked in the implementation plan. **Phase 1 (this commit) = bootstrap only**: monorepo, skeletons, configs, env, health check, CI. No business features yet.
