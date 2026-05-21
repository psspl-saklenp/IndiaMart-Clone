# React / Next.js Rules

> These rules apply specifically to the `frontend/` Next.js application.

---

## App Router Fundamentals
- **Server Components by default.** Every component starts as a Server Component.
- Add `'use client'` ONLY when the component needs:
  - Browser APIs (`window`, `document`, `navigator`, `localStorage`)
  - React hooks (`useState`, `useEffect`, `useRef`, `useContext`)
  - Event handlers (`onClick`, `onChange`, `onSubmit`)
- Push `'use client'` as far **down** the component tree as possible — keep Server Components as wrappers.
- Never use `useEffect` to fetch data. Use TanStack Query or `async` Server Components instead.

## Route Groups
| Group | Path prefix | Who can access |
|---|---|---|
| `(public)` | `/`, `/product/:slug`, `/category/:slug`, `/supplier/:slug`, `/search`, `/requirements`, `/requirements/new` | Public — no auth required |
| `(auth)` | `/login`, `/register` | Public only — redirect if already logged in |
| `(buyer)` | `/me/*` | Any authenticated user (buyer, seller, admin) |
| `(seller)` | `/seller/*` | `seller` or `admin` role |
| `(admin)` | `/admin/*` | `admin` role only |

**`(public)` layout** — `DynamicNavbar` + `GuestBanner` + `BuyerFooter`. No `Protected` wrapper.
**`(buyer)` layout** — `BuyerAppBar` + `BuyerSidebar` + `Protected allow={['buyer','seller','admin']}`.

Route protection for authenticated areas is done in `frontend/src/features/auth/protected.tsx` — do not duplicate logic elsewhere.

When adding a new page that should be accessible without login, place it under `(public)`. When adding a dashboard-style page for authenticated users, place it under `(buyer)/me/`.

## State Management

### TanStack Query (server state)
- ALL data from the API goes through TanStack Query.
- Query keys live in each feature's `api.ts` as a `queryKeys` object:
  ```ts
  export const queryKeys = {
    all: ['products'] as const,
    list: (filters: Filters) => [...queryKeys.all, 'list', filters] as const,
    detail: (slug: string) => [...queryKeys.all, 'detail', slug] as const,
  };
  ```
- Mutations MUST invalidate affected query keys on `onSuccess`.
- Use `staleTime` appropriately — static data (categories) can be longer, user-specific data shorter.

### Redux (client state)
Redux is ONLY for:
- `auth` slice: `user`, `status`, thunks for `login/logout/register/hydrate/upgradeToSeller`
- `ui` slice: cross-component flags (modal open/close, sidebar state)

**Never put in Redux:** products, sellers, inquiries, requirements, search results, or any server data.

## Components

### File & naming conventions
- One component per file.
- File name = component name (PascalCase): `ProductCard.tsx`, `SellerBadge.tsx`.
- Co-locate component tests: `ProductCard.test.tsx` next to `ProductCard.tsx`.

### Component types
- **Page components** (`app/**/page.tsx`) — async Server Components. Fetch data directly.
- **Layout components** (`app/**/layout.tsx`) — Server Components. Receive children.
- **Feature components** (`features/**/components/`) — can be server or client. Keep client surface minimal.
- **UI primitives** (`components/ui/`) — reusable, stateless. Never import from `features/`.

### Props
- Define a `Props` interface at the top of every component file.
- Avoid prop drilling more than 2 levels — use TanStack Query or React Context instead.

## Auth & Tokens
- Access token lives in **Redux `auth` slice memory only**.
- Never write the access token to `localStorage`, `sessionStorage`, or a cookie.
- Refresh token is `httpOnly` — the frontend never accesses it directly.
- On page reload: the axios interceptor detects 401, calls `/auth/refresh`, retries. This is handled in `src/lib/axios.ts` — do not duplicate this logic.

## Axios
- Single shared Axios instance: `frontend/src/lib/axios.ts`.
- Always use this instance — never create `axios.create()` elsewhere.
- The refresh interceptor dedupes concurrent refresh calls via a shared in-flight promise.
- Never import `axios` directly; import the configured instance: `import { api } from '@/lib/axios'`.
- The `api` export is a named export from `axios.ts`. Do not use `import api from '@/lib/axios'` (that is a default import and will fail).

## Styling (Tailwind CSS v4)
- Use `@theme` variables defined in `globals.css` — do not use arbitrary Tailwind values.
- No inline `style={{}}` unless absolutely unavoidable (e.g. dynamic values not expressible in Tailwind).
- Dark mode follows the `class` strategy — use `dark:` prefix.
- Responsive design: mobile-first. Start with small screen, add `md:` / `lg:` breakpoints.

## Image Uploads
Always check which upload backend is active before uploading:
```ts
const { backend } = await api.get('/uploads/status').then(r => r.data);
if (backend === 's3') {
  // POST /uploads/presign → get uploadUrl → PUT directly to S3
} else {
  // POST /uploads/file multipart
}
```

## Adding a New Feature
1. Create `src/features/<domain>/` folder
2. Add files: `api.ts`, `types.ts`, `hooks/`, `components/`
3. Add page(s) in `src/app/` under the correct route group
4. Ensure route protection via `protected.tsx`
5. Mutations must invalidate relevant TanStack Query keys
6. Write Vitest tests for hooks and key components
