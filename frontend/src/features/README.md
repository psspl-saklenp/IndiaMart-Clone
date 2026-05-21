# Features

Feature-sliced modules. Each subfolder owns its UI components, hooks, API client wrappers, and TanStack Query keys for one product surface.

All features listed below are **fully implemented**.

---

## Module Index

| Feature | Route group(s) | Key files |
|---|---|---|
| `admin/` | `(admin)` | `admin-dashboard.tsx`, `admin-users.tsx`, `admin-sellers.tsx`, `admin-products.tsx`, `admin-categories.tsx`, `api.ts` |
| `auth/` | `(auth)`, `(buyer)`, `(seller)`, `(admin)` | `login-form.tsx`, `register-form.tsx`, `protected.tsx`, `seller-signup-modal.tsx`, `seller-signup-trigger.tsx`, `use-sell-action.ts`, `api.ts` |
| `buyer/` | `(buyer)` | `buyer-dashboard.tsx`, `buyer-profile.tsx`, `buyer-faq.tsx`, `buyer-ship.tsx`, `know-your-seller.tsx`, `use-buyer-profile.ts`, `dashboard-data.ts` |
| `categories/` | `(public)`, `(admin)` | `api.ts`, `use-category-tree.ts` |
| `dashboard/` | `(seller)` | `seller-dashboard.tsx`, `api.ts` |
| `home/` | `(public)` | `home-hero-search.tsx`, `home-category-grid.tsx`, `home-featured-products.tsx`, `home-featured-suppliers.tsx`, `home-buy-leads-preview.tsx`, `home-auth-redirect.tsx` |
| `inquiries/` | `(buyer)`, `(seller)` | `inquiry-list.tsx`, `inquiry-thread.tsx`, `inquiry-dialog.tsx`, `use-inquiry-counts.ts`, `api.ts` |
| `products/` | `(public)`, `(buyer)` | `product-image-gallery.tsx`, `category-product-grid.tsx`, `search-results.tsx`, `api.ts` |
| `requirements/` | `(public)`, `(buyer)`, `(seller)` | `public-requirements-feed.tsx`, `my-requirements-list.tsx`, `post-requirement-form.tsx`, `seller-leads.tsx`, `api.ts` |
| `saved/` | `(buyer)` | `saved-list.tsx`, `save-heart.tsx`, `use-saved-set.ts`, `api.ts` |
| `search/` | `(public)`, `(buyer)` | `api.ts` |
| `seller/` | `(seller)` | `seller-product-list.tsx`, `product-form.tsx`, `product-edit-loader.tsx`, `product-image-manager.tsx` |
| `sellers/` | `(public)`, `(seller)` | `profile-editor.tsx`, `api.ts` |
| `uploads/` | `(seller)` | `api.ts` |

---

## Conventions

- Each feature's `api.ts` exports a `queryKeys` object and typed axios wrapper functions.
- Feature components may be Server or Client Components — prefer Server; push `'use client'` to leaf nodes.
- Hooks live directly in the feature folder (e.g. `use-inquiry-counts.ts`) or in a `hooks/` subfolder.
- New features follow the pattern: `api.ts` + `types.ts` + component file(s) + hook file(s).
- Shared stateless UI primitives go in `src/components/ui/`, not in a feature folder.
