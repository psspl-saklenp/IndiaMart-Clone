import Link from 'next/link';
import { Suspense } from 'react';

import { ProductCard } from '@/components/product/product-card';
import { SearchBar } from '@/components/layout/search-bar';
import { SupplierCard } from '@/components/supplier/supplier-card';
import { listCategoryTree } from '@/features/categories/api';
import { listProducts } from '@/features/products/api';
import { listSellers } from '@/features/sellers/api';
import { getCategoryIcon } from '@/lib/category-icons';
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
  const verifiedSuppliers = suppliers.filter((s) => s.isVerifiedSupplier);
  const supplierStrip = verifiedSuppliers.length >= 4 ? verifiedSuppliers : suppliers;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 via-brand-700 to-ink-900 p-6 text-white shadow-[var(--shadow-card)] sm:p-10">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-300">
            India&apos;s B2B marketplace
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-4xl">
            Find the right supplier for every product,
            <span className="block text-sun-300">every quantity.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85">
            Browse {Math.max(categoriesData.length, 6)}+ industries, connect with
            verified suppliers, and send inquiries with one click.
          </p>
          <div className="mt-5 max-w-xl">
            <Suspense fallback={<div className="h-10 rounded-md bg-white/20" />}>
              <SearchBar placeholder="e.g. industrial bearings, cotton t-shirt, TMT bars…" />
            </Suspense>
          </div>
          {categoriesData.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-white/70">Popular:</span>
              {categoriesData.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-white/90 transition-colors hover:border-white/50 hover:bg-white/20"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="grid grid-cols-2 gap-3 rounded-md border border-ink-200 bg-white p-3 text-center sm:grid-cols-4">
        {[
          { label: 'Verified suppliers', value: '10K+' },
          { label: 'Product categories', value: `${Math.max(categoriesData.length, 6)}+` },
          { label: 'Inquiries / day', value: '5K+' },
          { label: 'Cities covered', value: 'Pan-India' },
        ].map((stat) => (
          <div key={stat.label} className="px-2 py-1">
            <p className="text-base font-bold text-ink-900">{stat.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-ink-500">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Browse by category */}
      {categoriesData.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-ink-900">Popular categories</h2>
            <span className="text-xs text-ink-500">
              {categoriesData.length} top-level categories
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {categoriesData.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex h-full flex-col items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-4 text-center transition-shadow hover:border-brand-300 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-2xl"
                  >
                    {getCategoryIcon(cat.slug)}
                  </span>
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-ink-900">
                    {cat.name}
                  </p>
                  {cat.children && cat.children.length > 0 && (
                    <p className="text-[10px] text-ink-500">
                      {cat.children.length} sub-cats
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Post-requirement callout band */}
      <section className="flex flex-col items-start gap-3 rounded-md border border-sun-200 bg-sun-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sun-700">
            One requirement → multiple quotes
          </p>
          <h2 className="mt-0.5 text-base font-bold text-ink-900 sm:text-lg">
            Tell us what you need. Get free quotes within 24 hours.
          </h2>
        </div>
        <Link
          href="/requirements/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-card)] hover:bg-brand-700"
        >
          Post your requirement →
        </Link>
      </section>

      {/* Trending products */}
      {trending.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-ink-900">Trending products</h2>
            <Link
              href="/search?q="
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Verified suppliers */}
      {supplierStrip.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-ink-900">Verified suppliers</h2>
            <span className="text-xs text-ink-500">Sorted by rating</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {supplierStrip.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        </section>
      )}

      {/* Sell with us band */}
      <section className="flex flex-col items-start gap-4 rounded-md border border-ink-200 bg-ink-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-300">
            Grow your business
          </p>
          <h2 className="mt-1 text-lg font-bold sm:text-xl">
            Reach lakhs of buyers, free to start.
          </h2>
          <p className="mt-1 text-xs text-ink-300">
            List your products, receive verified inquiries, and respond directly to leads.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/register?role=seller"
            className="rounded-md bg-sun-400 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-sun-300"
          >
            Sell on indiamart-clone
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            Seller log in
          </Link>
        </div>
      </section>
    </div>
  );
}
