# indiamart-clone

A production-quality B2B marketplace web portal inspired by IndiaMART.

> **Status:** Phase 2 of 9 — authentication is live. JWT access + refresh tokens, role-based access (buyer / seller / admin), bcrypt-hashed passwords, registration & login UI, and an admin seeder are all wired up. See [`docs/architecture.md`](docs/architecture.md) for the full roadmap.

## Tech stack

| Layer        | Choice                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| Frontend     | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4       |
| State        | Redux Toolkit (client state), TanStack Query v5 (server state)         |
| Backend      | NestJS 11, TypeScript 5, Sequelize-TypeScript, Joi config validation   |
| Database     | PostgreSQL 16 (`uuid-ossp`, `pg_trgm`, `unaccent`)                     |
| Auth         | JWT access + refresh (added in Phase 2)                                |
| Object store | AWS S3 via presigned URLs (added in Phase 3)                           |
| Tooling      | npm workspaces, ESLint, Prettier, Docker Compose, GitHub Actions       |

## Repository layout

```
indiamart-clone/
├── backend/                NestJS API (port 3001)
├── frontend/               Next.js app (port 3000)
├── docker/                 Container init scripts (Postgres bootstrap SQL)
├── docs/                   Living architecture docs
├── .github/workflows/      CI
├── docker-compose.yml      Local Postgres 16 + pgAdmin
└── package.json            npm workspaces root
```

## Prerequisites

| Tool           | Version       | Notes                                                      |
| -------------- | ------------- | ---------------------------------------------------------- |
| Node.js        | `>= 20.10.0`  | Pin via `.nvmrc`. Windows users: install via `nvm-windows` or `winget install OpenJS.NodeJS`. |
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

## Database setup (Phase 2+)

Auth depends on the `users`, `buyer_profiles`, and `seller_profiles` tables. After `db:up` is healthy, run the migrations and the admin seeder:

```pwsh
npm run migrate          # creates tables
npm run seed             # creates the default admin user
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
# Backend (NestJS) → http://localhost:3001
npm run dev:backend

# Frontend (Next.js) → http://localhost:3000
npm run dev:frontend
```

### Smoke checks

| Check               | URL                                              | Expected                                              |
| ------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| Backend liveness    | <http://localhost:3001/health>                   | `{ "status": "ok", ... }`                             |
| Backend DB readiness| <http://localhost:3001/health/db>                | `{ "database": { "connected": true, ... } }`          |
| Swagger / OpenAPI   | <http://localhost:3001/api/docs>                 | Swagger UI                                             |
| Frontend home       | <http://localhost:3000>                          | Sticky navbar with login/sign-up; status panel                  |
| Login page          | <http://localhost:3000/login>                    | Centered card; works against the seeded admin                    |
| Register page       | <http://localhost:3000/register>                 | Buyer/seller toggle, validation, redirects on success            |

## Useful commands

```pwsh
# Lint everything
npm run lint

# Run all tests across workspaces
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

Migrations and seeders are wired through `sequelize-cli`; their npm aliases (`migrate`, `seed`, etc.) become useful starting in Phase 2.

## Environment variables

Each workspace owns its own `.env.example`:

- **`./.env`** — only consumed by `docker-compose.yml` (DB credentials, pgAdmin login).
- **`backend/.env`** — backend runtime (port, DB connection, JWT secrets, AWS placeholders).
- **`frontend/.env.local`** — frontend public vars (`NEXT_PUBLIC_API_URL`, etc.).

Backend env vars are validated by Joi on boot (`backend/src/config/validation.schema.ts`); missing/invalid values fail fast with a clear error.

## Project conventions

- TypeScript strict mode in both workspaces.
- `path/file.ts` references in code use the path aliases declared in each workspace's `tsconfig.json` (e.g. `@/lib/axios`, `@modules/users`).
- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, …).
- All git operations require explicit approval (per project rule); we never `git push`.

## Troubleshooting

| Problem                                                  | Fix                                                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Backend boot fails with Joi error                        | Copy `backend/.env.example` → `backend/.env` and fill `JWT_SECRET` / `JWT_REFRESH_SECRET` (≥16 chars). |
| `docker compose up` says port 5432 already in use        | A native Postgres is running. Stop it, or change `DB_PORT` in `.env`.                              |
| Frontend can't reach backend                             | Confirm backend is on port 3001 and `NEXT_PUBLIC_API_URL` matches. CORS allows `CLIENT_URL` only.   |
| `npm install` fails on Windows due to long paths         | Run `git config --system core.longpaths true` and re-install.                                      |

## Auth at a glance (Phase 2)

| Endpoint                 | Method | Auth        | Notes                                                                   |
| ------------------------ | ------ | ----------- | ----------------------------------------------------------------------- |
| `/api/v1/auth/register`  | POST   | Public      | Buyer or seller (admin role cannot self-register). Throttled 10/hour.   |
| `/api/v1/auth/login`     | POST   | Public      | bcrypt-verified; returns access token, sets refresh cookie. 5/min.       |
| `/api/v1/auth/refresh`   | POST   | Cookie      | Reads `refresh_token` httpOnly cookie; rotates both tokens.              |
| `/api/v1/auth/logout`    | POST   | Public      | Clears the refresh cookie.                                              |
| `/api/v1/auth/me`        | GET    | Bearer JWT  | Current user with linked profile.                                       |

Session model:

- **Access token**: JWT, 15-minute lifetime, returned in JSON, held in browser memory only (Redux + axios module). Never written to `localStorage`.
- **Refresh token**: JWT, 7-day lifetime, sent as `httpOnly` `Secure` (in production) `SameSite=Lax` cookie. Rotated on every `/auth/refresh` call.
- All routes are protected by default (global `JwtAuthGuard`). Use `@Public()` to opt out and `@Roles(...)` plus `RolesGuard` to restrict by role.

## Next steps

Phase 3 — Catalog (categories, products + images, S3 presigned upload). See [`docs/architecture.md`](docs/architecture.md) for the full roadmap.
