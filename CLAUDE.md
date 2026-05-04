# CLAUDE.md — IndiaMart Clone

> **Read this file first.** Claude Code loads `CLAUDE.md` automatically at the start of every session.
> Sub-packages also have their own `CLAUDE.md` — Claude Code merges them all.

---

## 0. Detailed Rule Files

**Before doing any work, read the relevant rule file(s) below:**

| Rule file | When to read it |
|---|---|
| `.claude/rules/general-rules.md` | Always — applies to all code |
| `.claude/rules/nestjs-rules.md` | When working in `backend/` |
| `.claude/rules/react-rules.md` | When working in `frontend/` |
| `.claude/rules/project-specific-rules.md` | Always — domain logic and architectural constraints |

These files contain the detailed, specific rules. This `CLAUDE.md` provides the overview and command reference.

---

## 1. Project Overview

A **production-quality B2B marketplace** inspired by IndiaMART.
- **Buyers** search products, send inquiries, post buy-leads (requirements).
- **Sellers** manage a product catalog, respond to inquiries, and view KPI dashboards.
- **Admins** moderate users, products, and verify suppliers.

---

## 2. Monorepo Layout

```
indiamart-clone/              ← npm workspaces root
├── frontend/                 ← Next.js 15 · App Router · React 19 · Tailwind v4
├── backend/                  ← NestJS 11 · Sequelize-TypeScript · PostgreSQL 16
├── docker/                   ← Postgres bootstrap SQL
├── docs/                     ← Architecture docs
├── .github/workflows/        ← CI (lint + build + tests)
└── docker-compose.yml        ← Local Postgres + pgAdmin
```

**Node ≥ 20.10 · npm ≥ 10** — enforced by `engines` in `package.json`.

---

## 3. Essential Dev Commands

> Run all commands from the **repo root** unless stated otherwise.

### Start everything locally
```bash
# 1. Spin up Postgres + pgAdmin
npm run db:up

# 2. Backend (http://localhost:3001)
npm run dev:backend

# 3. Frontend (http://localhost:3000)
npm run dev:frontend
```

### Database
```bash
npm run migrate          # Run pending Sequelize migrations
npm run migrate:undo     # Undo last migration
npm run seed             # Run all seeders (idempotent)
npm run db:reset         # Wipe volumes + restart containers
```

### Code quality
```bash
npm run lint             # ESLint across both workspaces
npm run lint:fix         # Auto-fix lint errors
npm run format           # Prettier write
npm run format:check     # Prettier check (used in CI)
npm run test             # Vitest (frontend) + Jest (backend)
```

### Build
```bash
npm run build:frontend
npm run build:backend
npm run build            # Both workspaces
```

---

## 4. Environment Setup

### First-time setup checklist
```bash
# Root (docker-compose vars)
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
# → Edit backend/.env: fill JWT_SECRET, JWT_REFRESH_SECRET (min 32 chars each)

# Frontend
cp frontend/.env.example frontend/.env.local
# → Defaults work out-of-the-box for local dev
```

### Key env vars (backend)
| Variable | Purpose | Default |
|---|---|---|
| `NODE_ENV` | Runtime mode | `development` |
| `PORT` | NestJS port | `3001` |
| `CLIENT_URL` | Allowed CORS origin(s) | `http://localhost:3000` |
| `DB_HOST/PORT/USER/PASS/NAME_DEVELOPMENT` | Postgres connection | see `.env.example` |
| `JWT_SECRET` | Access-token signing key | **MUST set** |
| `JWT_REFRESH_SECRET` | Refresh-token signing key | **MUST set** |
| `AWS_S3_BUCKET` | S3 upload bucket | optional (local-disk fallback) |
| `THROTTLE_TTL/LIMIT` | Rate-limit window/cap | `60000` / `100` |

### Key env vars (frontend)
| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | `http://localhost:3000` |

---

## 5. Architecture Quick-Reference

### Backend — NestJS modules
| Module | Key routes |
|---|---|
| `auth` | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/auth/upgrade-to-seller` |
| `products` | `GET /products`, `GET /products/:slug`, `POST/PATCH/DELETE /products` |
| `sellers` | `GET /sellers`, `GET /sellers/:slug`, `GET /sellers/me` |
| `inquiries` | `GET/POST /inquiries`, `/inquiries/:id/reply` |
| `requirements` | `GET/POST /requirements`, `POST /requirements/:id/respond` |
| `search` | `GET /search?q=&type=all\|products\|suppliers\|categories`, `GET /search/suggest` |
| `uploads` | `POST /uploads/presign`, `POST /uploads/file`, `GET /uploads/status` |
| `admin` | `/admin/stats`, `/admin/users`, `/admin/products` |
| `health` | `GET /health` |

All routes are prefixed `/api/v1/`. Swagger UI at `/api/docs` (dev only).

### Frontend — Route groups
| Group | Path prefix | Guard |
|---|---|---|
| `(auth)` | `/login`, `/register` | Public |
| `(buyer)` | `/`, `/products`, `/suppliers`, `/inquiries`, `/requirements`, `/saved` | Any authenticated user |
| `(seller)` | `/seller/*` | `seller` or `admin` role |
| `(admin)` | `/admin/*` | `admin` role only |

### Auth flow
- Access token → 15 min, in-memory only (Redux `auth` slice).
- Refresh token → 7 days, `httpOnly` cookie, rotated on every use.
- On page reload: axios interceptor calls `/auth/me` → 401 → calls `/auth/refresh` → retries.

---

## 6. Coding Conventions

### General
- **TypeScript strict mode** everywhere. No `any` without an explanatory comment.
- **Prettier** config in `.prettierrc`. Run `npm run format` before committing.
- **ESLint** rules must pass (`npm run lint`). CI blocks merges on lint failures.
- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

### Backend (NestJS)
- Every public route gets `@Public()`. Every role-restricted route gets `@Roles(UserRole.X)`.
- DTOs live next to their controller. Always use `class-validator` decorators.
- Services own business logic. Controllers own HTTP shape (status codes, response wrappers).
- Use `PaginatedResult<T>` for all list endpoints.
- Never call `Model.sync()` or `sequelize.sync()` — use migrations only.
- Fire-and-forget side effects (e.g. view-count increment) must be wrapped in try/catch and never `await`ed on the hot path.
- New database columns → new migration. Never mutate an existing migration that has been committed.

### Frontend (Next.js)
- **Server Components** by default. Use `'use client'` only when you need browser APIs or event handlers.
- Data fetching: **TanStack Query** for server state. **Redux** only for cross-cutting client state (`auth`, `ui`).
- Never store the access token in `localStorage` or `sessionStorage`.
- New features → new folder under `src/features/<domain>/`. Follow the existing pattern: `hooks/`, `components/`, `api.ts`, `types.ts`.
- Image uploads: call `GET /uploads/status` first, then branch on `backend` field (`s3` vs `local`).

### Database
- All PKs are UUIDs generated by `uuid-ossp`.
- Every table has `created_at`, `updated_at`. Paranoid tables also have `deleted_at`.
- `paranoid: true` and `underscored: true` are global Sequelize defaults — do not override per-model without a strong reason.
- New seeders must be idempotent (use `findOrCreate` / upsert pattern).

---

## 7. Testing

### Backend — Jest
```bash
npm run test --workspace=backend
npm run test:watch --workspace=backend
npm run test:cov --workspace=backend
```
- Unit tests live next to the file (`*.spec.ts`).
- E2E tests live in `backend/test/`.

### Frontend — Vitest
```bash
npm run test --workspace=frontend
```
- Tests live next to the component (`*.test.tsx`).

---

## 8. Claude Code Agent Rules

> These rules apply to **every Claude Code session** in this repo.

1. **Read before writing.** Before adding or changing code, read the relevant module's existing implementation to understand the pattern in use.
2. **One migration per change.** Never edit a committed migration. Generate a new one.
3. **No direct DB access.** All DB operations go through Sequelize models and services — never raw SQL in controllers.
4. **Guard all secrets.** Never hard-code secrets. Always reference `process.env.*` variables defined in `.env`.
5. **Feature flags via env.** Use `process.env.FEATURE_*` for experimental features, not code comments.
6. **Don't break existing API contracts.** When modifying a route, check all frontend callers first.
7. **Run lint + test before declaring done.** Always run `npm run lint` and `npm run test` and confirm they pass.
8. **Prefer small, focused PRs.** One logical change per task. Use sub-tasks for large features.
9. **Update docs.** If you change the architecture, update `docs/architecture.md`. If you add an env var, update the relevant `.env.example`.
10. **Ask before destructive operations.** Never drop columns, tables, or run `db:reset` without explicit user confirmation.

---

## 9. Deployment

| Target | Where |
|---|---|
| Frontend | Vercel |
| Backend | Render or Fly.io |
| Database | Render Postgres or Neon |
| Object Storage | AWS S3 (local-disk fallback for dev) |

See `docs/architecture.md` for full deployment notes.

---

## 10. Useful Links (local dev)
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Swagger UI: http://localhost:3001/api/docs
- pgAdmin: http://localhost:5050 (admin@indiamart.local / admin)
