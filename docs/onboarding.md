# Developer Onboarding Guide

This guide gets a new developer from zero to a running local environment and explains everything needed to contribute to the project without help from anyone else.

---

## Table of Contents

- [What is this project?](#what-is-this-project)
- [Prerequisites](#prerequisites)
- [Getting the Code Running — Step by Step](#getting-the-code-running--step-by-step)
- [How the Codebase is Organised](#how-the-codebase-is-organised)
- [Key Concepts to Understand First](#key-concepts-to-understand-first)
  - [Auth Flow](#auth-flow)
  - [Route Groups](#route-groups)
  - [State Management](#state-management)
  - [Database Access Pattern](#database-access-pattern)
  - [Image Uploads](#image-uploads)
- [Making Your First Change](#making-your-first-change)
  - [Adding a backend API endpoint](#adding-a-backend-api-endpoint)
  - [Adding a frontend page or feature](#adding-a-frontend-page-or-feature)
- [Common Gotchas](#common-gotchas)
- [Daily Development Workflow](#daily-development-workflow)
- [Running Tests](#running-tests)
- [Useful URLs](#useful-urls)

---

## What is this project?

A production-quality B2B marketplace (IndiaMART-inspired) where:
- **Buyers** browse products, contact suppliers, and post buy requirements.
- **Sellers** manage a product catalog, respond to inquiries, and view a KPI dashboard.
- **Admins** moderate users, products, and verify suppliers.

**Stack at a glance:** Next.js 15 (App Router) · NestJS 11 · PostgreSQL 16 · JWT auth · AWS S3 (optional).

---

## Prerequisites

Install these before anything else:

| Tool | Version | How to install |
|---|---|---|
| Node.js | ≥ 20.10 | `winget install OpenJS.NodeJS` (Windows) or via `nvm` |
| npm | ≥ 10 | Ships with Node 20 |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop/ |
| Git | any | https://git-scm.com/downloads |

Verify:
```bash
node --version   # v20.x.x or later
npm --version    # 10.x.x or later
docker --version # any recent
```

---

## Getting the Code Running — Step by Step

### 1. Clone and install

```bash
git clone <repo-url> indiamart-clone
cd indiamart-clone
npm install
```

### 2. Set up environment files

```bash
# Root — for Docker Compose
cp .env.example .env

# Backend — NestJS
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in the two required JWT secrets (minimum 32 characters each):
```
JWT_SECRET=your-strong-secret-here-at-least-32-chars
JWT_REFRESH_SECRET=a-different-strong-secret-also-min-32-chars
```
Everything else in `backend/.env` works out of the box for local development.

```bash
# Frontend — Next.js
cp frontend/.env.example frontend/.env.local
# No changes needed — defaults point to http://localhost:3001
```

### 3. Start the database

Make sure Docker Desktop is running, then:
```bash
npm run db:up
```

Wait ~10 seconds, then verify Postgres is healthy:
```bash
docker compose ps
# Should show postgres as "healthy"
```

### 4. Run migrations and seed data

```bash
npm run migrate   # Creates all 12 tables
npm run seed      # Creates admin user + category tree
```

This is idempotent — you can re-run it safely.

Default admin account created by the seeder:
- Email: `admin@indiamart.local`
- Password: `ChangeMe@123`

### 5. Start the dev servers

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
npm run dev:backend
# → http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
# → http://localhost:3000
```

### 6. Verify everything works

| Check | URL | Expected |
|---|---|---|
| Backend health | http://localhost:3001/api/v1/health | `{"status":"ok"}` |
| DB connected | http://localhost:3001/api/v1/health/db | `{"database":{"connected":true}}` |
| Swagger UI | http://localhost:3001/api/docs | Swagger UI loads |
| Frontend | http://localhost:3000 | Marketing homepage |
| Login | http://localhost:3000/login | Login page; sign in with admin credentials |

---

## How the Codebase is Organised

```
indiamart-clone/
├── backend/src/
│   ├── app.module.ts              Root module — wires everything
│   ├── main.ts                    Bootstrap: middleware, guards, Swagger
│   ├── config/                    Joi-validated env config (fail-fast on missing vars)
│   ├── database/
│   │   ├── migrations/            0001-… numbered .js migration files
│   │   └── seeders/               0001-… numbered .js seeder files
│   ├── common/
│   │   ├── decorators/            @Public(), @Roles(), @CurrentUser()
│   │   └── guards/                JwtAuthGuard, RolesGuard, JwtRefreshGuard
│   └── modules/
│       ├── auth/                  Register, login, refresh, logout, me, upgrade
│       ├── users/                 User + profile models and service
│       ├── categories/            Category tree
│       ├── products/              Product CRUD + images
│       ├── sellers/               Supplier directory + profiles
│       ├── inquiries/             Buyer–seller messaging
│       ├── requirements/          Buy-leads feed
│       ├── saved-products/        Wishlist
│       ├── search/                Unified search + autocomplete
│       ├── seller-dashboard/      KPI dashboard
│       ├── admin/                 Platform moderation
│       └── uploads/               S3 presign + local-disk fallback
│
└── frontend/src/
    ├── app/
    │   ├── (public)/              No-auth pages: home, products, categories, suppliers, search
    │   ├── (auth)/                Login, register
    │   ├── (buyer)/               /me/* authenticated dashboard
    │   ├── (seller)/              /seller/* seller area
    │   └── (admin)/               /admin/* admin area
    ├── components/                Shared UI primitives and layout components
    ├── features/                  Feature-sliced modules (one folder per domain)
    ├── lib/
    │   ├── axios.ts               Single Axios instance with 401-refresh interceptor
    │   └── queryClient.ts         TanStack Query client config
    ├── store/
    │   ├── slices/auth.slice.ts   Auth state: user, status, login/logout/hydrate thunks
    │   └── slices/ui.slice.ts     Cross-component UI flags (seller signup modal)
    └── types/                     Shared TypeScript types
```

---

## Key Concepts to Understand First

### Auth Flow

Two JWTs are issued on login:
- **Access token** (15 min) — returned in the JSON response body, stored **in memory only** (a module-level variable in `axios.ts` and the Redux `auth` slice). Never written to `localStorage`.
- **Refresh token** (7 days) — sent as an `httpOnly SameSite=Lax` cookie. The frontend never reads it directly.

On page reload the access token is gone. The Axios response interceptor in `frontend/src/lib/axios.ts` handles this transparently:
1. Any 401 triggers a `POST /auth/refresh` using the cookie.
2. If refresh succeeds, the new access token is stored and the original request is retried.
3. If refresh fails (cookie expired or missing), the user is treated as logged out.

**Never duplicate this logic.** All auth retry handling is in `axios.ts`.

### Route Groups

| Group | Path | Auth |
|---|---|---|
| `(public)` | `/`, `/product/:slug`, `/category/:slug`, `/supplier/:slug`, `/search`, `/requirements` | None — guests can browse |
| `(auth)` | `/login`, `/register` | Redirects if already logged in |
| `(buyer)` | `/me/*` | Any authenticated user |
| `(seller)` | `/seller/*` | `seller` or `admin` role |
| `(admin)` | `/admin/*` | `admin` role only |

Route protection lives in `frontend/src/features/auth/protected.tsx` and is applied in each group's `layout.tsx`.

### State Management

Two complementary tools — never mix their responsibilities:

| Tool | Used for | Never use for |
|---|---|---|
| **Redux Toolkit** | `auth` (user, status, access token) and `ui` (modal open/close) | Server data |
| **TanStack Query** | All API data: products, sellers, inquiries, requirements, search | Client-only state |

When you need to show API data in a component, use TanStack Query. When you need to know if the user is logged in, read from Redux.

### Database Access Pattern

The backend uses Sequelize-TypeScript. The pattern is strict:

1. **Controller** — parse HTTP input, call service, return response. No DB calls.
2. **Service** — business logic, ownership checks, DB queries via Sequelize models.
3. **Model** — Sequelize model definition (`@Table`, `@Column`, `@BelongsTo`).
4. **Migration** — the single source of truth for the schema.

**Never** call `sequelize.sync()` or modify a committed migration. To add a column, generate a new migration:
```bash
# From the backend/ directory:
npx sequelize-cli migration:generate --name add-phone-to-users
```

The next available migration number is `0013`.

### Image Uploads

Two backends are supported. Always check which is active before uploading:
```ts
const { backend } = await api.get('/uploads/status').then(r => r.data);
```

- **`s3`** — use `POST /uploads/presign` to get a presigned URL, then PUT the file directly to S3.
- **`local`** — use `POST /uploads/file` multipart.

In both cases, after the file is stored, call `POST /products/:id/images` with the resulting URL.

For local development, `AWS_S3_BUCKET` is left empty, so the local-disk fallback is active by default.

---

## Making Your First Change

### Adding a backend API endpoint

1. Identify the module (or create a new one under `backend/src/modules/<name>/`).
2. Add or update the DTO in `dto/`.
3. Add the service method with business logic.
4. Add the controller route with correct decorators (`@Public()` or `@Roles()`, Swagger decorators).
5. If the change touches the DB schema, create a new migration.
6. Run `npm run lint --workspace=backend` and `npm run test --workspace=backend`.

### Adding a frontend page or feature

1. Create or open `frontend/src/features/<domain>/`.
2. Add `api.ts` with query keys and axios calls.
3. Add components (Server Component by default; add `'use client'` only at leaf nodes).
4. Add the page file under the correct route group in `frontend/src/app/`.
5. If the page requires auth, wrap the layout with `<Protected>` (most groups already do this in `layout.tsx`).
6. Run `npm run lint --workspace=frontend`.

---

## Common Gotchas

| Problem | Root cause | Fix |
|---|---|---|
| Backend crashes on startup with Joi error | `JWT_SECRET` or `JWT_REFRESH_SECRET` not set | Edit `backend/.env` and add both (≥ 32 chars each) |
| `docker compose up` says port 5432 in use | A native Postgres is running | Stop it, or change `DB_PORT` in `.env` |
| Frontend 401 errors in the browser console | Access token expired and refresh cookie missing | Log out, log back in |
| `/uploads/presign` returns 503 | `AWS_S3_BUCKET` is unset | Expected for local dev — use `POST /uploads/file` instead |
| `npm install` fails on Windows (long path error) | Windows path limit | `git config --system core.longpaths true` then re-run |
| Migrations fail with "relation already exists" | Partial schema in DB | `npm run migrate:undo:all --workspace=backend` then `npm run migrate` |
| Seeder fails with unique constraint | Re-seeding after manual data changes | Safe to ignore if same data — seeders are idempotent by design |
| Frontend shows blank page after login | Redux auth not hydrated | Check browser console; try clearing cookies and logging in fresh |

---

## Daily Development Workflow

```bash
# 1. Make sure DB is running
npm run db:up

# 2. Start backend (watch mode — restarts on file changes)
npm run dev:backend

# 3. Start frontend (Turbopack — instant HMR)
npm run dev:frontend

# Before committing:
npm run lint        # Must pass — CI blocks on lint failures
npm run test        # Run both Jest (backend) and Vitest (frontend)
npm run format      # Auto-format with Prettier
```

Commit messages must follow Conventional Commits:
```
feat: add product review endpoint
fix: resolve 401 loop on token refresh
docs: update architecture.md with new module
refactor: extract pagination helper to common utils
test: add unit tests for requirements service
chore: update dependencies
```

---

## Running Tests

```bash
# All tests (backend + frontend)
npm run test

# Backend only (Jest)
npm run test --workspace=backend

# Backend with coverage
npm run test:cov --workspace=backend

# Frontend only (Vitest)
npm run test --workspace=frontend

# Backend end-to-end (needs DB running)
npm run test:e2e --workspace=backend
```

Backend unit tests live next to the file they test (`*.spec.ts`). Frontend tests live next to the component (`*.test.tsx`).

---

## Useful URLs

| URL | What it is |
|---|---|
| http://localhost:3000 | Frontend (public home) |
| http://localhost:3000/login | Login page |
| http://localhost:3001/api/v1/health | Backend liveness check |
| http://localhost:3001/api/v1/health/db | DB connectivity check |
| http://localhost:3001/api/docs | Swagger UI (all API endpoints, try-it-out) |
| http://localhost:5050 | pgAdmin (email: `admin@indiamart.local` / password: `admin`) |

The Swagger UI is the fastest way to explore the full API surface. Every endpoint is documented with request/response shapes and can be called directly from the browser after clicking "Authorize" and pasting a Bearer token.

---

## Claude Code Agent Rules (if using AI assistance)

The project has pre-configured rules for Claude Code in `.claude/rules/`. The key constraints:

- Never edit a migration that has been committed — create a new one.
- Never enable `synchronize: true` in the database module.
- All routes are protected by default; use `@Public()` to opt out.
- The access token must never be written to `localStorage`.
- Run `npm run lint` and `npm run test` and confirm they pass before declaring work done.
- When adding a new env var, always add it to the relevant `.env.example`.

Full rules: `.claude/rules/general-rules.md`, `.claude/rules/nestjs-rules.md`, `.claude/rules/react-rules.md`, `.claude/rules/project-specific-rules.md`.
