# General Coding Rules

> These rules apply to ALL code in this repository (frontend + backend).

---

## Code Quality
- **TypeScript strict mode** everywhere. No `any` without an explanatory comment explaining why it's unavoidable.
- Maximum **function length: 50 lines**. Split into smaller functions if longer.
- Maximum **file length: 300 lines**. Split into modules if longer.
- No commented-out code blocks in committed code. Use git history instead.
- No `console.log` in production code. Use NestJS `Logger` in backend, remove in frontend.

## Naming Conventions
- `camelCase` → variables, functions, method names
- `PascalCase` → classes, React components, TypeScript interfaces/types
- `SCREAMING_SNAKE_CASE` → constants (`MAX_UPLOAD_SIZE`, `JWT_EXPIRATION`)
- `kebab-case` → file names, folder names, URL slugs
- `snake_case` → database column names (Sequelize `underscored: true` handles this automatically)

## Imports & Dependencies
- Group imports: 1) Node/external packages 2) Internal modules 3) Relative imports. Separate with blank lines.
- No circular imports. If you need A→B and B→A, extract a shared module C.
- Never `import * as X` — always use named or default imports explicitly.
- Don't install a new npm package if the same functionality can be achieved with code already in the project or Node.js built-ins.

## Error Handling
- Never silently swallow errors with empty `catch {}` blocks.
- Always include a meaningful message when throwing errors.
- Fire-and-forget async operations must be wrapped in `try/catch` to prevent unhandled promise rejections.

## Secrets & Environment
- **Zero secrets in code.** No API keys, JWT secrets, passwords, or connection strings hard-coded anywhere.
- Always use `process.env.VARIABLE_NAME`.
- Every new env var must be added to the relevant `.env.example` with a comment explaining its purpose.

## Git & Commits
- Commit messages follow **Conventional Commits**:
  - `feat: add product review feature`
  - `fix: resolve 401 loop on token refresh`
  - `chore: update dependencies`
  - `docs: update architecture.md with new module`
  - `refactor: extract pagination helper`
  - `test: add unit tests for products service`
- One logical change per commit. Do not bundle unrelated changes.
- Never commit `.env` files, `node_modules/`, or generated build artifacts.

## Security
- Sanitize all user input via DTOs + `class-validator` (backend) or Zod/validation (frontend).
- Never trust client-supplied IDs for ownership — always verify server-side.
- Rate limit all auth endpoints.
- Use `helmet` for HTTP security headers.
