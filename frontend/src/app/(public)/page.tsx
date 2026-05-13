import Link from 'next/link';
import { Suspense } from 'react';

import { HomeAuthRedirect } from '@/features/home/home-auth-redirect';
import { HomeCategoryGrid } from '@/features/home/home-category-grid';
import { HomeFeaturedProducts } from '@/features/home/home-featured-products';
import { HomeFeaturedSuppliers } from '@/features/home/home-featured-suppliers';
import { HomeBuyLeadsPreview } from '@/features/home/home-buy-leads-preview';
import { HomeHeroSearch } from '@/features/home/home-hero-search';

export const metadata = {
  title: 'indiamart-clone | India\'s B2B Marketplace',
  description:
    'Connect with verified suppliers, discover products, and grow your business. Browse millions of products across hundreds of categories.',
};

export default function PublicHomePage() {
  return (
    <div className="space-y-10">
      {/* Redirect logged-in users to their dashboard */}
      <HomeAuthRedirect />
      {/* Hero */}
      <section className="-mx-4 -mt-6 overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#176a6d] px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-yellow-300/80">
            India&apos;s B2B Marketplace
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">
            Find the right supplier,{' '}
            <span className="text-yellow-300">fast.</span>
          </h1>
          <p className="mt-4 text-base text-white/70 sm:text-lg">
            Browse verified suppliers, compare prices, and send inquiries — all in one place.
          </p>

          {/* Hero search */}
          <div className="mt-8">
            <Suspense fallback={<div className="h-12 rounded-xl bg-white/10 animate-pulse" />}>
              <HomeHeroSearch />
            </Suspense>
          </div>

          {/* Quick category pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            {[
              { label: 'Electronics', slug: 'electronics' },
              { label: 'Textiles', slug: 'textiles' },
              { label: 'Machinery', slug: 'machinery' },
              { label: 'Chemicals', slug: 'chemicals' },
              { label: 'Agriculture', slug: 'agriculture' },
            ].map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white/90 transition-colors hover:bg-white/20"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { value: '10K+', label: 'Verified Suppliers', icon: '🏭' },
          { value: '50K+', label: 'Products Listed', icon: '📦' },
          { value: '1M+', label: 'Registered Buyers', icon: '🛒' },
          { value: '500+', label: 'Categories', icon: '🗂️' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 rounded-xl border border-ink-200 bg-white p-4 text-center shadow-sm"
          >
            <span className="text-2xl" aria-hidden>{stat.icon}</span>
            <span className="text-xl font-extrabold text-brand-700">{stat.value}</span>
            <span className="text-xs text-ink-500">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Category grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink-900">Browse by Category</h2>
        </div>
        <Suspense fallback={<CategoryGridSkeleton />}>
          <HomeCategoryGrid />
        </Suspense>
      </section>

      {/* Featured products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink-900">Featured Products</h2>
          <Link href="/search" className="text-sm font-medium text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <HomeFeaturedProducts />
        </Suspense>
      </section>

      {/* CTA — post requirement */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 p-8 text-white">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Can&apos;t find what you need?</h2>
            <p className="mt-1 text-sm text-white/80">
              Post a buy requirement and let verified suppliers come to you with their best prices.
            </p>
          </div>
          <Link
            href="/requirements/new"
            className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-md transition-all hover:bg-brand-50 hover:shadow-lg"
          >
            Post Requirement →
          </Link>
        </div>
      </section>

      {/* Featured suppliers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink-900">Verified Suppliers</h2>
          <Link href="/search?type=suppliers" className="text-sm font-medium text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        <Suspense fallback={<SupplierGridSkeleton />}>
          <HomeFeaturedSuppliers />
        </Suspense>
      </section>

      {/* Buy leads preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink-900">Latest Buy Requirements</h2>
          <Link href="/requirements" className="text-sm font-medium text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        <p className="text-sm text-ink-500">
          Buyers are actively looking for these products. Register as a seller to respond.
        </p>
        <Suspense fallback={<BuyLeadsSkeleton />}>
          <HomeBuyLeadsPreview />
        </Suspense>
      </section>

      {/* Why register CTA */}
      <section className="rounded-2xl border border-ink-200 bg-white p-8">
        <h2 className="text-center text-xl font-bold text-ink-900">
          Why join indiamart-clone?
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: '💬',
              title: 'Direct Inquiries',
              desc: 'Contact suppliers directly and get quotes within 24 hours.',
            },
            {
              icon: '✅',
              title: 'Verified Suppliers',
              desc: 'Every supplier is vetted. Buy with confidence.',
            },
            {
              icon: '📋',
              title: 'Post Requirements',
              desc: 'Tell us what you need and suppliers will reach out to you.',
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl">
                {f.icon}
              </span>
              <h3 className="font-semibold text-ink-900">{f.title}</h3>
              <p className="text-sm text-ink-500">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-700 hover:shadow-lg"
          >
            Register as Buyer — Free
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-brand-600 bg-white px-8 py-3 text-sm font-bold text-brand-700 transition-all hover:bg-brand-50"
          >
            Register as Seller
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ---- Skeletons ---- */

function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-xl bg-ink-200" />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-ink-200" />
      ))}
    </div>
  );
}

function SupplierGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-ink-200" />
      ))}
    </div>
  );
}

function BuyLeadsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-ink-200" />
      ))}
    </div>
  );
}
