'use client';

import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';

import { DashboardSearch } from '@/components/layout/dashboard-search';
import { getCounts, listInquiries } from '@/features/inquiries/api';
import { listMyRequirements } from '@/features/requirements/api';
import { getCategoryIcon } from '@/lib/category-icons';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/catalog';

import {
  ACTIVITY_TILES,
  PLACEHOLDER_BRANDS,
  PROMO_TILES,
  TESTIMONIALS,
  TILE_TONE_CLASS,
  type ActivityTileMeta,
  type PromoTile,
  type Testimonial,
} from './dashboard-data';

interface BuyerDashboardProps {
  /** Server-fetched categories shown in the "Categories You May Like" strip. */
  categories: Category[];
}

export function BuyerDashboard({ categories }: BuyerDashboardProps) {
  // All buyer-specific data is fetched client-side so the bearer token
  // (held in module memory by the axios client) is attached automatically.
  const [reqQ, inqQ, countsQ] = useQueries({
    queries: [
      { queryKey: ['my-requirements'], queryFn: listMyRequirements },
      {
        queryKey: ['inquiries', { viewer: 'buyer', limit: 1 }],
        queryFn: () => listInquiries({ limit: 1 }),
      },
      { queryKey: ['inquiry-counts'], queryFn: getCounts },
    ],
  });

  const requirements = reqQ.data ?? [];
  const totalInquiries = inqQ.data?.meta.total ?? 0;
  const buyerReplies = countsQ.data?.asBuyer ?? 0;

  const tileValues: Record<ActivityTileMeta['icon'], number> = {
    inquiry: totalInquiries,
    lead: requirements.length,
    reply: buyerReplies,
    call: 0, // No call-tracking API yet.
  };

  return (
    <div className="space-y-6">
      <DashboardSearch />
      <MyOrdersCard hasRequirements={requirements.length > 0} />
      <CategoriesYouMayLike categories={categories} />
      <YourActivity tiles={ACTIVITY_TILES} values={tileValues} />
      <TopBrandsStrip />
      <MoreForYou />
      <BuyerTestimonials />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                              My Orders                                   */
/* ------------------------------------------------------------------------ */

function MyOrdersCard({ hasRequirements }: { hasRequirements: boolean }) {
  return (
    <section className="rounded-md border border-ink-200 bg-white shadow-sm">
      <header className="border-b border-ink-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-ink-900">My Orders</h2>
      </header>
      <div className="px-4 py-10">
        {hasRequirements ? (
          <div className="text-center text-sm text-ink-500">
            <Link
              href="/me/requirements"
              className="font-medium text-[var(--color-im-teal-700)] hover:underline"
            >
              View all your requirements &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <PackageIllustration />
            <p className="mt-3 text-sm text-ink-500">
              No requirements posted yet. Post one to receive quotations.
            </p>
            <Link
              href="/requirements/new"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[var(--color-im-teal-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-im-teal-700)]"
            >
              <PlusIcon />
              Post a Requirement
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/*                       Categories You May Like                            */
/* ------------------------------------------------------------------------ */

function CategoriesYouMayLike({ categories }: { categories: Category[] }) {
  const display = categories.slice(0, 4);
  if (display.length === 0) return null;
  return (
    <SectionCard title="Categories You May Like">
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {display.map((cat) => (
          <li key={cat.id}>
            <div className="flex h-full flex-col rounded-md border border-ink-200 bg-white p-3 text-center transition-shadow hover:shadow-[var(--shadow-card-hover)]">
              <div className="flex flex-1 items-center justify-center rounded bg-ink-50 py-6 text-4xl">
                <span aria-hidden>{getCategoryIcon(cat.slug)}</span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-medium text-ink-900">{cat.name}</p>
              <Link
                href={`/category/${cat.slug}`}
                className="mt-3 inline-flex justify-center rounded-md bg-[var(--color-im-teal-600)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--color-im-teal-700)]"
              >
                Get Quotes
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------------ */
/*                            Your Activity                                 */
/* ------------------------------------------------------------------------ */

function YourActivity({
  tiles,
  values,
}: {
  tiles: ActivityTileMeta[];
  values: Record<ActivityTileMeta['icon'], number>;
}) {
  return (
    <SectionCard title="Your Activity">
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.icon}>
            <div
              className={cn(
                'flex items-center gap-3 rounded-md border border-ink-200 p-4',
                TILE_TONE_CLASS[tile.tone].bg,
              )}
            >
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-md bg-white',
                  TILE_TONE_CLASS[tile.tone].iconFg,
                )}
                aria-hidden
              >
                <ActivityIcon name={tile.icon} />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-ink-900">
                  {values[tile.icon].toLocaleString('en-IN')}
                </p>
                <p className="truncate text-xs text-ink-600">{tile.label}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function ActivityIcon({ name }: { name: ActivityTileMeta['icon'] }) {
  const props = {
    viewBox: '0 0 24 24',
    className: 'size-5',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
  switch (name) {
    case 'inquiry':
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8M8 13h6" />
        </svg>
      );
    case 'lead':
      return (
        <svg {...props}>
          <path d="M3 17l5-5 4 4 8-8" />
          <path d="M14 8h6v6" />
        </svg>
      );
    case 'reply':
      return (
        <svg {...props}>
          <path d="M21 12a8 8 0 0 1-12 6.9L3 21l2.1-5.7A8 8 0 1 1 21 12z" />
        </svg>
      );
    case 'call':
      return (
        <svg {...props}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.18 4.18 2 2 0 0 1 4.16 2h3a2 2 0 0 1 2 1.72c.13.96.34 1.9.63 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.29 1.85.5 2.81.63A2 2 0 0 1 22 16.92z" />
        </svg>
      );
  }
}

/* ------------------------------------------------------------------------ */
/*                            Top Brands strip                              */
/* ------------------------------------------------------------------------ */

function TopBrandsStrip() {
  return (
    <SectionCard title="Top Brands on the Marketplace">
      <ul className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {PLACEHOLDER_BRANDS.map((brand) => (
          <li
            key={brand.name}
            className="flex h-20 flex-col items-center justify-center rounded-md border border-ink-100 bg-ink-50/50 px-3 text-center"
          >
            <span
              className={cn(
                'text-base font-extrabold tracking-tight',
                brand.colorClass,
              )}
            >
              {brand.name}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-wide text-ink-500">
              {brand.tagline}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-ink-400">
        Brand names shown above are fictional placeholders for layout purposes only.
      </p>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------------ */
/*                              More For You                                */
/* ------------------------------------------------------------------------ */

function MoreForYou() {
  return (
    <SectionCard title="More For You">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROMO_TILES.map((tile) => (
          <li key={tile.title}>
            <PromoCard tile={tile} />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function PromoCard({ tile }: { tile: PromoTile }) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-md border border-ink-200 p-4',
        tile.toneClass,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-md bg-white shadow-sm" aria-hidden>
        <PromoIcon name={tile.icon} />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink-900">{tile.title}</p>
      <p className="mt-1 flex-1 text-xs text-ink-600">{tile.description}</p>
      <Link
        href={tile.ctaHref}
        className="mt-3 inline-flex w-full justify-center rounded-md bg-[var(--color-im-teal-600)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--color-im-teal-700)]"
      >
        {tile.ctaLabel}
      </Link>
    </div>
  );
}

function PromoIcon({ name }: { name: PromoTile['icon'] }) {
  const props = {
    viewBox: '0 0 24 24',
    className: 'size-5 text-[var(--color-im-navy-700)]',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
  switch (name) {
    case 'verified':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
          <path d="M16 6l1.5 1.5L20 5" />
        </svg>
      );
    case 'sell':
      return (
        <svg {...props}>
          <path d="M3 9l1.5-4.5h15L21 9" />
          <path d="M4 9v11h16V9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case 'app':
      return (
        <svg {...props}>
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
    case 'mobile':
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      );
  }
}

/* ------------------------------------------------------------------------ */
/*                          What Our Buyers Say                             */
/* ------------------------------------------------------------------------ */

function BuyerTestimonials() {
  return (
    <SectionCard title="What Our Buyers Say">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t) => (
          <li key={t.name}>
            <TestimonialCard testimonial={t} />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-md border border-ink-200 bg-white p-4 shadow-sm">
      <p className="text-xs italic text-ink-700">&ldquo;{testimonial.quote}&rdquo;</p>
      <div
        className={cn(
          'mt-auto flex aspect-video items-center justify-center rounded-md',
          testimonial.thumbColorClass,
        )}
        aria-hidden
      >
        <PlayIcon />
      </div>
      <div>
        <p className="text-xs font-semibold text-ink-900">{testimonial.name}</p>
        <p className="text-[11px] text-ink-500">{testimonial.role}</p>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------------ */
/*                              Shared bits                                 */
/* ------------------------------------------------------------------------ */

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-ink-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-sm font-semibold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

function PackageIllustration() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="size-16 text-ink-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M32 6l24 12v28L32 58 8 46V18z" />
      <path d="M8 18l24 12 24-12" />
      <path d="M32 30v28" />
      <path d="M20 12l24 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-10 text-white drop-shadow"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
