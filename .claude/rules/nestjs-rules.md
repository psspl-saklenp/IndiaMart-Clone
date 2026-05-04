# NestJS Rules

> These rules apply specifically to the `backend/` NestJS application.

---

## Module Structure
Every domain module must follow this file layout:
```
modules/<name>/
├── <name>.module.ts       # Imports + providers + exports
├── <name>.controller.ts   # HTTP layer only
├── <name>.service.ts      # Business logic only
├── <name>.model.ts        # Sequelize model
└── dto/
    ├── create-<name>.dto.ts
    ├── update-<name>.dto.ts
    └── <name>-response.dto.ts
```

## Controllers
- Controllers handle **HTTP concerns only**: parse input → call service → shape response.
- Never put business logic, DB queries, or conditional branching in a controller.
- Always use the correct HTTP method: `@Get`, `@Post`, `@Patch` (not Put), `@Delete`.
- Always use `@HttpCode(HttpStatus.X)` explicitly when returning non-200.
- Add Swagger decorators to every endpoint:
  ```ts
  @ApiTags('products')
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Paginated product list' })
  ```

## Services
- Services own all business logic, data access, and error throwing.
- Inject Sequelize models via `@InjectModel(ModelName)`.
- Throw NestJS exceptions — never plain `Error`:
  - `NotFoundException` — resource not found
  - `ForbiddenException` — wrong role / not owner
  - `ConflictException` — duplicate (email, slug, etc.)
  - `BadRequestException` — invalid input not caught by DTO
  - `UnauthorizedException` — not authenticated
- Ownership checks go in the service via a dedicated `assertOwnerOrAdmin()` method.

## Guards & Decorators
- `JwtAuthGuard` is global — all routes require auth by default.
- Opt out with `@Public()` for routes that must be unauthenticated.
- Restrict by role with `@Roles(UserRole.Seller)` or `@Roles(UserRole.Admin)`.
- Guard execution order: `ThrottlerGuard` → `JwtAuthGuard` → `RolesGuard`.
- Use `@CurrentUser()` decorator to access the authenticated user in controllers.

## DTOs & Validation
- Every request body, query param, and route param must have a typed DTO.
- Use `class-validator` decorators (`@IsString()`, `@IsEmail()`, `@IsUUID()`, etc.).
- Use `@IsOptional()` only on fields that are truly optional (PATCH DTOs).
- `ValidationPipe` is global with `whitelist: true, forbidNonWhitelisted: true, transform: true` — rely on it.
- Use `@Type(() => Number)` for query params that should be numbers.

## Database (Sequelize)
- `synchronize: false` always. Never enable `synchronize: true`.
- Never call `Model.sync()` or `sequelize.sync()`.
- Schema changes → new migration file. Never edit a committed migration.
- All models must have `paranoid: true` and `underscored: true` (global defaults).
- Use `findAndCountAll` for paginated queries — return `PaginatedResult<T>`.
- Use `transaction()` for operations that span multiple models.

## Pagination
All paginated endpoints accept `?page=&limit=&sort=&order=` and return:
```ts
{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Rate Limiting
- Global default: `THROTTLE_TTL` ms window, `THROTTLE_LIMIT` requests.
- Auth endpoints get stricter per-route limits via `@Throttle({ default: { limit: 5, ttl: 60000 } })`.
- Login: 5 req/min. Register: 10 req/hour.

## API Prefix
All routes are under `/api/v1/`. This is set globally in `main.ts`. Do not add the prefix manually in controllers.

## Swagger
- Enabled only when `NODE_ENV !== 'production'` and `SWAGGER_ENABLED=true`.
- Available at `/api/docs`.
- Always add `@ApiBearerAuth()` to protected endpoints.
