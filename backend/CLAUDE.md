# CLAUDE.md — Backend (NestJS)

> Supplements the root `CLAUDE.md`. Read both.

---

## ⚠️ Read This Rule File First

Before writing any backend code, read: **`.claude/rules/nestjs-rules.md`**
It contains the authoritative NestJS / Sequelize patterns for this project.

---

## Stack
- **NestJS 11** — module-based architecture
- **TypeScript 5** (strict)
- **Sequelize-TypeScript** — ORM (`synchronize: false`, migrations only)
- **PostgreSQL 16** — UUID PKs, `pg_trgm`, `unaccent`, `uuid-ossp` extensions
- **Passport / JWT** — two secrets (access + refresh), cookie-based refresh
- **Swagger / OpenAPI** — auto-generated, served at `/api/docs` (dev only)
- **Jest** — unit + e2e tests

---

## Directory Structure

```
src/
├── app.module.ts            # Root module — wires all domain modules
├── main.ts                  # Bootstrap: global pipes, guards, middleware
├── config/
│   └── validation.schema.ts # Joi env validation (fail-fast on missing vars)
├── database/
│   ├── database.module.ts   # Sequelize module setup
│   ├── migrations/          # 0001-… numbered migration files
│   └── seeders/             # 0001-… numbered seeder files
├── common/
│   ├── decorators/          # @Public(), @Roles(), @CurrentUser()
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── pipes/               # (reserved)
│   ├── interceptors/        # (reserved)
│   └── dto/                 # PaginatedResult<T>, shared DTOs
└── modules/
    ├── health/
    ├── users/
    ├── auth/
    ├── categories/
    ├── products/
    ├── sellers/
    ├── inquiries/
    ├── requirements/
    ├── saved-products/
    ├── search/
    ├── seller-dashboard/
    ├── admin/
    └── uploads/
```

Each module folder contains: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.model.ts` (Sequelize model), and `dto/` subfolder.

---

## Key Rules

### Routing
- All routes are prefixed `/api/v1/` (set globally in `main.ts`).
- Public routes must be decorated with `@Public()`.
- Role-restricted routes must be decorated with `@Roles(UserRole.Seller)` etc.
- Guard order: **ThrottlerGuard → JwtAuthGuard → RolesGuard**.

### DTOs & Validation
- Every request body/query/param must have a DTO with `class-validator` decorators.
- `ValidationPipe` is global with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- Response shapes: controllers return plain objects or `PaginatedResult<T>`.

### Services vs Controllers
- **Services** own all business logic, DB queries, and error throwing.
- **Controllers** only: parse input → call service → format HTTP response.
- Never put `Model.findAll()` or DB calls directly in a controller.

### Database / Migrations
- **NEVER** call `sequelize.sync()` or enable `synchronize: true`.
- **NEVER** edit a migration that has already been committed.
- To add a column: generate a new migration `XXXX-add-<field>-to-<table>.ts`.
- Use `queryInterface.addColumn` / `removeColumn` — always provide `up` AND `down`.
- Migration naming: `0013-add-phone-to-users.ts` (zero-padded, sequential).
- Seeders must be idempotent — use `findOrCreate` or check-before-insert.

### Auth
- Access token: 15 min, returned in JSON body, stored in Redux (never localStorage).
- Refresh token: 7 days, `httpOnly` `SameSite=Lax` cookie, rotated on every refresh.
- Two JWT secrets: `JWT_SECRET` (access) and `JWT_REFRESH_SECRET` (refresh).
- bcrypt rounds = 12 (constant in `auth.service.ts` — do not change without migration plan).

### Error Handling
- Throw NestJS built-in exceptions: `NotFoundException`, `ForbiddenException`, `ConflictException`, `BadRequestException`, `UnauthorizedException`.
- Never swallow errors silently in services.
- Fire-and-forget side effects (e.g. view-count) must be wrapped in try/catch.

### Pagination
All paginated list endpoints accept `?page=&limit=&sort=&order=` and return:
```ts
{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```
Use the shared `PaginatedResult<T>` type from `src/common/dto/`.

### Uploads
- Check `AWS_S3_BUCKET` presence at runtime — return 503 with guidance if missing.
- Local-disk fallback saves files under `backend/uploads/<purpose>/`.
- Never proxy S3 bytes through the backend — always use presigned PUT URLs.

### Adding a New Module
1. `nest generate module modules/<name>`
2. `nest generate controller modules/<name>` + `nest generate service modules/<name>`
3. Create the Sequelize model in `modules/<name>/<name>.model.ts`.
4. Add a migration for the new table.
5. Import the module in `app.module.ts`.
6. Add Swagger decorators to the controller.
7. Write unit tests for the service.

---

## Dev Commands (run from repo root)
```bash
npm run dev:backend          # http://localhost:3001 (watch mode)
npm run build:backend
npm run migrate              # Run pending migrations
npm run migrate:undo         # Undo last migration
npm run seed                 # Run all seeders
npm run test                 # Jest
npm run test:watch --workspace=backend
npm run test:cov --workspace=backend
```

### Backend-only commands (from backend/ directory)
```bash
npx sequelize-cli migration:generate --name add-<field>-to-<table>
npx sequelize-cli seed:generate --name <name>
```

---

## Swagger
Available at **http://localhost:3001/api/docs** in `development` mode.
All controllers and DTOs should have `@ApiTags`, `@ApiOperation`, `@ApiResponse` decorators.
