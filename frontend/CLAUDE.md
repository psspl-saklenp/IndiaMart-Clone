# CLAUDE.md — Frontend (Next.js)

> Supplements the root `CLAUDE.md`. Read both.

---

## ⚠️ Read This Rule File First

Before writing any frontend code, read: **`.claude/rules/react-rules.md`**
It contains the authoritative Next.js / React patterns for this project.

---

## Stack
- **Next.js 15** — App Router (no `pages/` directory)
- **React 19**
- **TypeScript 5** (strict)
- **Tailwind CSS v4** — CSS-first config (`@import "tailwindcss"` + `@theme` in `globals.css`)
- **TanStack Query v5** — all server state
- **Redux Toolkit** — cross-cutting client state only (`auth`, `ui` slices)
- **Axios** — single shared instance at `src/lib/axios.ts` with 401-refresh interceptor
- **Vitest + Testing Library** — unit tests

---

## Directory Structure

```
src/
├── app/
│   ├── (auth)/          # /login, /register — public
│   ├── (buyer)/         # buyer-facing pages — any authenticated user
│   ├── (seller)/        # seller dashboard — seller|admin role
│   ├── (admin)/         # admin panel — admin role only
│   └── layout.tsx       # root layout (providers, fonts)
├── components/
│   ├── layout/          # Navbar, Footer, Sidebar
│   ├── ui/              # Reusable primitives (Button, Input, Modal…)
│   ├── product/         # ProductCard, ProductGrid…
│   ├── supplier/        # SupplierCard, SupplierBadge…
│   ├── charts/          # Dashboard chart wrappers
│   └── system/          # Error boundary, loading spinners
├── features/
│   ├── auth/            # Redux slice, protected.tsx, useAuth hook
│   ├── buyer/           # Buyer dashboard components + hooks
│   ├── categories/      # Category tree, breadcrumbs
│   ├── dashboard/       # Seller KPI dashboard
│   ├── inquiries/       # Inquiry list, thread view
│   ├── products/        # Product detail, CRUD forms
│   ├── requirements/    # Buy-leads list and detail
│   ├── saved/           # Saved products wishlist
│   ├── search/          # Search bar, results, autocomplete
│   ├── seller/          # Seller catalog editor (product CRUD)
│   └── sellers/         # Public supplier directory & profiles
├── lib/
│   ├── axios.ts         # Axios singleton + interceptors
│   ├── queryClient.ts   # TanStack Query client
│   └── utils.ts         # Generic helpers
├── store/
│   ├── index.ts         # Redux store
│   ├── auth.slice.ts    # auth state + thunks
│   └── ui.slice.ts      # cross-component UI flags
└── types/               # Shared TypeScript types / DTOs
```

---

## Key Rules

### Component Rules
- **Server Components by default.** Only add `'use client'` when you need:
  - Browser APIs (`window`, `document`, `localStorage`)
  - Event handlers (`onClick`, `onChange`)
  - React hooks (`useState`, `useEffect`, `useQuery`)
- Keep Server Components as high as possible; push `'use client'` down to leaf nodes.
- One component per file. File name = component name (PascalCase).

### Data Fetching
- **TanStack Query** for all API calls (products, sellers, inquiries, etc.).
- Query keys live in each feature's `api.ts` file — use the `queryKeys` object pattern.
- **Do NOT fetch data in Redux thunks** unless it's for auth (`login`, `register`, `hydrate`).
- Mutations must invalidate relevant query keys on success.

### State Management (Redux)
Redux only for:
- `auth` slice — `user`, `status`, access token, thunks
- `ui` slice — cross-component flags (seller signup modal open/close, etc.)

Do **not** put server data (products, orders, etc.) in Redux.

### Styling
- Tailwind CSS v4 — use `@theme` variables defined in `globals.css`, not arbitrary values.
- No `style={{}}` inline styles unless absolutely unavoidable.
- Dark mode: follow the existing `class` strategy.

### Auth / Route Protection
- `frontend/src/features/auth/protected.tsx` wraps protected layouts.
- It reads Redux `auth.status` and redirects unauthenticated/unauthorized users.
- Never trust role checks on the client alone — the backend enforces all authorization.

### Image Uploads
```ts
// Always check which backend is active before uploading
const status = await fetch('/api/v1/uploads/status').then(r => r.json());
if (status.backend === 's3') {
  // use presign flow
} else {
  // use multipart /uploads/file
}
```

### Adding a New Feature
1. Create `src/features/<domain>/` folder.
2. Add `api.ts` (axios calls + query keys), `types.ts`, `hooks/`, `components/`.
3. Register new pages under the correct route group in `src/app/`.
4. Add any new Redux state to `store/ui.slice.ts` (or a new slice if justified).

---

## Dev Commands (run from repo root)
```bash
npm run dev:frontend       # http://localhost:3000
npm run build:frontend
npm run lint               # includes frontend ESLint
npm run test               # Vitest
```
