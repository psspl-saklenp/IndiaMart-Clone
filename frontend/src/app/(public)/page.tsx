import Link from 'next/link';

import { ProductCard } from '@/components/product/product-card';
import { SearchBar } from '@/components/layout/search-bar';
import { SupplierCard } from '@/components/supplier/supplier-card';
import { listCategoryTree } from '@/features/categories/api';
import { listProducts } from '@/features/products/api';
import { listSellers } from '@/features/sellers/api';
import type { Category, Product, SellerSummary } from '@/types/catalog';

export default async function HomePage() {
  // Fan out the home page's three independent fetches; degrade gracefully if any fail.
  const [categories, trendingResult, suppliersResult] = await Promise.allSettled([
    listCategoryTree(),
    listProducts({ page: 1, limit: 8, sort: 'viewCount', order: 'desc' }),
    listSellers({ page: 1, limit: 8 }),
  ]);

  const categoriesData: Category[] =
    categories.status === 'fulfilled' ? categories.value : [];
  const trending: Product[] =
    trendingResult.status === 'fulfilled' ? trendingResult.value.data : [];
  const suppliers: SellerSummary[] =
    suppliersResult.status === 'fulfilled' ? suppliersResult.value.data : [];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-8 text-white sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
          India&apos;s B2B marketplace
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold sm:text-5xl">
          Find the right supplier for every product, every quantity.
        </h1>
        <p className="mt-3 max-w-2xl text-sm opacity-90 sm:text-base">
          Browse {Math.max(categoriesData.length, 6)}+ industries, connect with verified
          suppliers, and send inquiries with one click.
        </p>
        <div className="mt-6 max-w-xl">
          <SearchBar placeholder="e.g. industrial bearings, cotton t-shirt, TMT bars…" />
        </div>
        {categoriesData.length > 0 && (
          <p className="mt-4 text-xs opacity-90">
            Popular:{' '}
            {categoriesData.slice(0, 4).map((c, i) => (
              <span key={c.id}>
                {i > 0 && ' · '}
                <Link
                  href={`/category/${c.slug}`}
                  className="underline-offset-2 hover:underline"
                >
                  {c.name}
                </Link>
              </span>
            ))}
          </p>
        )}
      </section>

      {/* Browse by category */}
      {categoriesData.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-ink-900">Browse by category</h2>
            <span className="text-xs text-ink-500">
              {categoriesData.length} top-level categories
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categoriesData.map((cat) => (
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

      {/* Trending products */}
      {trending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-ink-900">Trending products</h2>
            <Link
              href="/search?q="
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Top suppliers */}
      {suppliers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-ink-900">Top suppliers</h2>
            <span className="text-xs text-ink-500">Verified first, then by rating</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        </section>
      )}

      {/* Inquiry CTA strip */}
      <section className="flex flex-col items-start gap-4 rounded-2xl border border-ink-200 bg-ink-900 p-8 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
            Tell us what you need
          </p>
          <h2 className="mt-1 text-xl font-bold sm:text-2xl">
            Get free quotes from multiple suppliers.
          </h2>
          <p className="mt-1 text-sm text-ink-300">
            Sign up as a buyer and post your requirement — verified suppliers will respond.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/register?role=buyer"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Post requirement
          </Link>
          <Link
            href="/register?role=seller"
            className="rounded-md border border-white/30 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            Sell on indiamart-clone
          </Link>
        </div>
      </section>
    </div>
  );
}
