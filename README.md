# indiamart-clone

A production-quality B2B marketplace web portal inspired by IndiaMART.

> **Status:** Phase 1 of 9 — bootstrap only. The monorepo, framework skeletons, database, and CI are wired up. Real features (auth, catalog, search, inquiries, dashboards) ship in subsequent phases. See [`docs/architecture.md`](docs/architecture.md) for the full plan.

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
| Frontend home       | <http://localhost:3000>                          | "Phase 1 · Bootstrap complete" page with backend status |

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

## Next steps

Phase 2 — Authentication. See [`docs/architecture.md`](docs/architecture.md) and the implementation plan for the roadmap.
