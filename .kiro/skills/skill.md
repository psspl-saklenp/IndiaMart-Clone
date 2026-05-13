---
inclusion: auto
---

# IndiaMART Clone — Kiro Skill Guide

This file gives Kiro the project-specific context needed to work effectively in this codebase. Read it alongside the rule files in `.claude/rules/`.

---

## Project Identity

A **production-quality B2B marketplace** inspired by IndiaMART.

- **Buyers** browse products, send inquiries to suppliers, post buy-leads (requirements), and save products to a wishlist.
- **Sellers** manage a product catalog, respond to inquiries, view buy-leads, and track KPIs on a dashboard.
- **Admins** moderate users, verify suppliers, moderate products, and manage categories.

---

## Monorepo Structure

```
indiamart-clone/              ← npm workspaces root (Node ≥ 20.10, npm ≥ 10)
├── frontend/                 ← Next.js 15 · App Router · React 19 · Tailwind CSS v4
├── backend/                  ← NestJS 11 · Sequelize-TypeScript · PostgreSQL 16
├── docker/                   ← Postgres bootstrap SQL
├── docs/                     ← architecture.md (full architecture reference)
├── .github/workflows/        ← CI: lint + build + test (both workspaces)
└── docker-compose.yml        ← Local Postgres 16 + pgAdmin
```

---

## Essential Commands

Run all commands from the **repo root** unless stated otherwise.

```bash
# Start local infrastructure
npm run db:up                  # Postgres + pgAdmin via Docker Compose

# Dev servers
npm run dev:backend            # NestJS watch mode → http://localhost:3001
npm run dev:frontend           # Next.js + Turbopack → http://localhost:3000

# Database
npm run migrate                # Run pending Sequelize migrations
npm run migrate:undo           # Undo last migration
npm run seed                   # Run all seeders (idempotent)
npm run db:reset               # Wipe volumes + restart (DROPS ALL DATA — confirm first)

# Code quality
npm run lint                   # ESLint across both workspaces
npm run lint:fix               # Auto-fix lint errors
npm run format                 # Prettier write
npm run test                   # Vitest (frontend) + Jest (backend)

# Build
npm run build:frontend
npm run build:backend
npm run build                  # Both workspaces
```

---

## Backend — NestJS

### Module Locations

| Module | Path | Key responsibility |
|---|---|---|
| `auth` | `backend/src/modules/auth/` | Register, login, refresh, logout, me, upgrade-to-seller |
| `users` | `backend/src/modules/users/` | User, BuyerProfile, SellerProfile models + internal services |
| `categories` | `backend/src/modules/categories/` | Public tree + slug lookup; admin CRUD |
| `products` | `backend/src/modules/products/` | Listing, detail, mine, CRUD, image attach/detach |
| `sellers` | `backend/src/modules/sellers/` | Public directory, profile by slug, KYS lookup, me profile |
| `inquiries` | `backend/src/modules/inquiries/` | Create, role-scoped list, thread, reply, status, unread counts |
| `requirements` | `backend/src/modules/requirements/` | Buy-leads: list, feed, mine, create, close, seller respond |
| `saved-products` | `backend/src/modules/saved-products/` | Wishlist: list, ids-only, save, unsave |
| `search` | `backend/src/modules/search/` | Unified search + autocomplete suggester |
| `seller-dashboard` | `backend/src/modules/seller-dashboard/` | KPIs, daily timeseries, top products |
| `admin` | `backend/src/modules/admin/` | Platform stats, user/seller/product moderation |
| `uploads` | `backend/src/modules/uploads/` | S3 presigned PUT + local-disk fallback |
| `health` | `backend/src/common/health/` | Liveness + DB-readiness endpoints |

### Coding Rules

- **Services own business logic.** Controllers only parse input → call service → return response.
- **Ownership checks** live in services via `assertOwnerOrAdmin()`, not in guards.
- **Every public route** gets `@Public()`. Every role-restricted route gets `@Roles(UserRole.X)`.
- **DTOs** live next to their controller. Always use `class-validator` decorators.
- **Pagination** — use `PaginatedResult<T>` for all list endpoints. Query params: `?page=&limit=&sort=&order=`.
- **Never call** `Model.sync()` or `sequelize.sync()`. Migrations only.
- **Fire-and-forget side effects** (e.g. view-count increment) must be wrapped in `try/catch` and never `await`ed on the hot path.
- **New DB columns** → new migration. Never mutate a committed migration.
- **Slugs** are generated server-side via `slugify` with a uniqueness retry loop (random 6-char suffix on collision).

### Global Guard Order

```
ThrottlerGuard → JwtAuthGuard → RolesGuard
```

All routes are protected by default. Use `@Public()` to opt out.

### Auth Token Model

| Token | Lifetime | Storage | Rotation |
|---|---|---|---|
| Access token | 15 min | Browser memory (Redux + axios module) | On every refresh + role change |
| Refresh token | 7 days | `httpOnly Secure SameSite=Lax` cookie | On every `/auth/refresh` + `/auth/upgrade-to-seller` |

Two distinct JWT secrets: `JWT_SECRET` (access) and `JWT_REFRESH_SECRET` (refresh).

### Database Conventions

- All PKs: UUID generated by `uuid-ossp`.
- Every table: `created_at`, `updated_at`. Paranoid tables also: `deleted_at`.
- Global Sequelize defaults: `paranoid: true`, `underscored: true`, `synchronize: false`.
- Seeders must be idempotent (`findOrCreate` / upsert pattern).
- Trigram GIN index on `products.name` for fuzzy `ILIKE` search.

### Key Environment Variables (backend)

| Variable | Required | Notes |
|---|---|---|
| `JWT_SECRET` | Yes | ≥ 32 chars |
| `JWT_REFRESH_SECRET` | Yes | ≥ 32 chars, different from `JWT_SECRET` |
| `DB_HOST/PORT/USER/PASS/NAME_DEVELOPMENT` | Yes | Postgres connection |
| `CLIENT_URL` | Yes | Allowed CORS origin(s), comma-separated |
| `AWS_S3_BUCKET` | No | Enables S3 presigned uploads; local-disk fallback if unset |
| `THROTTLE_TTL` / `THROTTLE_LIMIT` | No | Rate-limit window (ms) / max requests |
| `SWAGGER_ENABLED` | No | Set `false` in production |

---

## Frontend — Next.js

### Route Groups

| Group | Path prefix | Guard |
|---|---|---|
| `(auth)` | `/login`, `/register` | Public |
| `(buyer)` | `/me/*`, `/category/:slug`, `/product/:slug`, `/supplier/:slug`, `/search`, `/requirements/new` | Any authenticated user |
| `(seller)` | `/seller/*` | `seller` or `admin` role |
| `(admin)` | `/admin/*` | `admin` role only |

Root `/` redirects to `/me/dashboard`.

### Feature Module Structure

New features go under `frontend/src/features/<domain>/` following this pattern:

```
features/<domain>/
├── components/        UI components for this feature
├── hooks/             Custom hooks (TanStack Query wrappers)
├── api.ts             Axios API call functions
└── types.ts           TypeScript types for this feature
```

### State Management Rules

- **TanStack Query v5** for all server state (products, inquiries, requirements, sellers, search, dashboards).
- **Redux Toolkit** only for cross-cutting client state:
  - `auth` slice — user, status, login/register/logout/hydrate thunks.
  - `ui` slice — seller signup modal and other cross-component UI state.
- **Never store the access token** in `localStorage` or `sessionStorage`.
- **Server Components** by default. Use `'use client'` only when you need browser APIs or event handlers.

### Axios Token Handling

The single Axios instance at `frontend/src/lib/axios.ts`:
- Stores the access token in module memory (not Redux, not localStorage).
- Has a response interceptor that detects 401s, calls `/auth/refresh` once (deduped via in-flight promise), and retries the original request.
- Short-circuits if the failing request is itself `/auth/refresh` to prevent loops.

### Image Upload Flow

1. Call `GET /uploads/status` to determine the active backend (`s3` or `local`).
2. If `s3`: call `POST /uploads/presign` → PUT directly to S3 → `POST /products/:id/images`.
3. If `local`: `POST /uploads/file` (multipart) → `POST /products/:id/images`.

### Key Environment Variables (frontend)

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | Backend base URL |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical site URL |
| `NEXT_PUBLIC_ENV` | `development` | Environment label |

---

## API Conventions

- All routes prefixed `/api/v1/`.
- Swagger UI at `http://localhost:3001/api/docs` (dev only).
- Paginated responses use `PaginatedResult<T>`:
  ```json
  { "data": [...], "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
  ```
- Rate limits: login 5/min, register 10/hour, global default from env.

---

## Data Model Quick Reference

```
users (1) ──── (1) buyer_profiles
users (1) ──── (1) seller_profiles
users (1) ──── (N) products          [as seller]
users (1) ──── (N) inquiries         [as buyer]
users (1) ──── (N) inquiries         [as seller]
users (1) ──── (N) requirements      [as buyer]
users (1) ──── (N) saved_products    [as buyer]

categories (1) ──── (N) categories   [self-referential parent_id]
categories (1) ──── (N) products
categories (1) ──── (N) requirements

products (1) ──── (N) product_images
products (1) ──── (N) inquiries
products (1) ──── (N) saved_products

inquiries (1) ──── (N) inquiry_messages
```

---

## Useful Local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api/v1 |
| Swagger UI | http://localhost:3001/api/docs |
| pgAdmin | http://localhost:5050 |
| Health check | http://localhost:3001/api/v1/health |
| Upload status | http://localhost:3001/api/v1/uploads/status |

---

## Before Declaring a Task Done

1. Run `npm run lint` — must pass with no errors.
2. Run `npm test` — all tests must pass.
3. If you added an env var, update the relevant `.env.example`.
4. If you changed the DB schema, add a new migration (never mutate a committed one).
5. If you changed the architecture, update `docs/architecture.md`.
6. Never `git push` without explicit user confirmation.
