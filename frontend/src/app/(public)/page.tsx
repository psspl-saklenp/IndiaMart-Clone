import Link from 'next/link';

import { BackendStatus } from '@/components/system/backend-status';
import { listCategoryTree } from '@/features/categories/api';
import type { Category } from '@/types/catalog';

export default async function HomePage() {
  let categories: Category[] = [];
  try {
    categories = await listCategoryTree();
  } catch {
    // Backend not reachable; we'll just show the status panel and prompt below.
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-8 text-white sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
          Phase 3 · Catalog ready
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-5xl">
          India&apos;s B2B marketplace, reimagined.
        </h1>
        <p className="mt-3 max-w-2xl text-sm opacity-90 sm:text-base">
          Connect with verified suppliers across {Math.max(categories.length, 6)}+ industries.
          Browse the catalog, send inquiries, grow your business.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {categories[0] && (
            <Link
              href={`/category/${categories[0].slug}`}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Browse {categories[0].name}
            </Link>
          )}
          <Link
            href="/register?role=seller"
            className="rounded-md border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
          >
            Sell on indiamart-clone
          </Link>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-ink-900">Browse by category</h2>
            <span className="text-xs text-ink-500">{categories.length} top-level categories</span>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="block h-full rounded-lg border border-ink-200 bg-white p-4 text-center transition-shadow hover:shadow-[var(--shadow-card-hover)]"
                >
                  <p className="text-sm font-medium text-ink-900">{cat.name}</p>
                  {cat.children && cat.children.length > 0 && (
                    <p className="mt-1 text-xs text-ink-500">
                      {cat.children.length} sub-categories
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <BackendStatus />
    </div>
  );
}
