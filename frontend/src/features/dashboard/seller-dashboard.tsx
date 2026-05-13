'use client';

import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { getStats, getTopProducts } from '@/features/dashboard/api';
import { listInquiries } from '@/features/inquiries/api';
import { cn } from '@/lib/utils';
import type { DashboardTopProduct } from '@/types/dashboard';
import type { InquirySummary } from '@/types/inquiries';

export function SellerDashboard() {
  const [topBy, setTopBy] = useState<'views' | 'inquiries'>('views');

  const [statsQ, recentQ, topQ] = useQueries({
    queries: [
      { queryKey: ['dash-stats'], queryFn: getStats },
      {
        queryKey: ['dash-recent-inquiries'],
        queryFn: () => listInquiries({ side: 'seller', limit: 5 }),
      },
      { queryKey: ['dash-top', topBy], queryFn: () => getTopProducts(topBy, 5) },
    ],
  });

  const stats = statsQ.data;
  const recent = recentQ.data?.data ?? [];
  const top = topQ.data;

  const last30 = stats?.last30dInquiries ?? 0;
  const prev30 = stats?.prev30dInquiries ?? 0;
  const delta = last30 - prev30;
  const deltaPct = prev30 > 0 ? Math.round((delta / prev30) * 100) : null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">
            A snapshot of your catalog activity. Numbers refresh on every load.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:from-brand-700 hover:to-brand-800 transition-all duration-150"
          >
            <span aria-hidden>+</span>
            Add product
          </Link>
          <Link
            href="/seller/inquiries"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:border-ink-300 transition-all duration-150"
          >
            View inquiries
          </Link>
        </div>
      </div>

      {statsQ.isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span aria-hidden>⚠️</span>
          {(statsQ.error as Error)?.message ?? 'Failed to load stats'}
        </div>
      )}

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Active products"
          value={stats?.activeProducts}
          hint={stats ? `${stats.totalProducts} total` : ''}
          icon="📦"
          tone="brand"
        />
        <KpiCard
          label="Lifetime views"
          value={stats?.totalViews}
          hint={stats?.conversionRate != null ? `${(stats.conversionRate * 100).toFixed(1)}% conversion` : ''}
          icon="👁️"
          tone="info"
        />
        <KpiCard
          label="Lifetime inquiries"
          value={stats?.totalInquiries}
          hint={stats ? `${stats.openInquiries} open · ${stats.respondedInquiries} responded` : ''}
          icon="💬"
          tone="success"
        />
        <KpiCard
          label="Inquiries (30d)"
          value={last30}
          hint={
            deltaPct == null
              ? prev30 === 0 && last30 === 0
                ? 'no inquiries yet'
                : 'first 30-day window'
              : `${deltaPct >= 0 ? '+' : ''}${deltaPct}% vs prior 30d`
          }
          deltaTone={delta >= 0 ? 'success' : 'danger'}
          icon="📈"
          tone={delta >= 0 ? 'success' : 'danger'}
        />
      </section>

      {/* Recent inquiries */}
      <section className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-ink-100 bg-gradient-to-r from-ink-50 to-white px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-100 text-sm" aria-hidden>💬</span>
            <h2 className="text-sm font-bold text-ink-900">Recent inquiries</h2>
          </div>
          <Link
            href="/seller/inquiries"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="p-5">
          {recentQ.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-10 rounded-xl skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded skeleton" />
                    <div className="h-2.5 w-1/2 rounded skeleton" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!recentQ.isLoading && recent.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-10 text-center">
              <span className="text-3xl" aria-hidden>📭</span>
              <p className="mt-2 text-sm font-medium text-ink-700">No inquiries yet</p>
              <p className="mt-1 text-xs text-ink-500">Once buyers reach out, the latest ones will appear here.</p>
            </div>
          )}

          {recent.length > 0 && (
            <ul className="divide-y divide-ink-100">
              {recent.map((inquiry) => (
                <RecentInquiryRow key={inquiry.id} inquiry={inquiry} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Top products */}
      <section className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-gradient-to-r from-ink-50 to-white px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-100 text-sm" aria-hidden>🏆</span>
            <h2 className="text-sm font-bold text-ink-900">Top products</h2>
          </div>
          <div className="flex gap-1 rounded-xl border border-ink-200 bg-white p-1 text-xs shadow-sm">
            <TabButton active={topBy === 'views'} onClick={() => setTopBy('views')}>
              By views
            </TabButton>
            <TabButton active={topBy === 'inquiries'} onClick={() => setTopBy('inquiries')}>
              By inquiries
            </TabButton>
          </div>
        </div>

        <div className="p-5">
          {topQ.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-6 rounded-full skeleton" />
                  <div className="size-12 rounded-xl skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded skeleton" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {top && top.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-10 text-center">
              <span className="text-3xl" aria-hidden>📦</span>
              <p className="mt-2 text-sm font-medium text-ink-700">No products yet</p>
              <p className="mt-1 text-xs text-ink-500">List a product to see it here.</p>
              <Link
                href="/seller/products/new"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                + Add product
              </Link>
            </div>
          )}
          {top && top.length > 0 && (
            <ul className="divide-y divide-ink-100">
              {top.map((product, i) => (
                <TopProductRow key={product.id} product={product} rank={i + 1} highlight={topBy} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                           KPI Card                                  */
/* ------------------------------------------------------------------ */

const KPI_TONE_STYLES = {
  brand: 'from-brand-50 to-white border-brand-100',
  info: 'from-sky-50 to-white border-sky-100',
  success: 'from-emerald-50 to-white border-emerald-100',
  danger: 'from-red-50 to-white border-red-100',
  neutral: 'from-ink-50 to-white border-ink-200',
};

function KpiCard({
  label,
  value,
  hint,
  deltaTone,
  icon,
  tone = 'neutral',
}: {
  label: string;
  value: number | undefined;
  hint?: string;
  deltaTone?: 'success' | 'danger';
  icon?: string;
  tone?: keyof typeof KPI_TONE_STYLES;
}) {
  return (
    <div className={cn('rounded-xl border bg-gradient-to-br p-4 shadow-sm', KPI_TONE_STYLES[tone])}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink-500">{label}</p>
        {icon && <span className="text-lg" aria-hidden>{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-bold text-ink-900">
        {value === undefined ? (
          <span className="inline-block h-8 w-16 rounded-lg skeleton" />
        ) : (
          value.toLocaleString('en-IN')
        )}
      </p>
      {hint && (
        <p
          className={cn(
            'mt-1.5 text-xs font-medium',
            deltaTone === 'danger' ? 'text-red-600' : deltaTone === 'success' ? 'text-emerald-600' : 'text-ink-500',
          )}
        >
          {deltaTone === 'success' && '↑ '}
          {deltaTone === 'danger' && '↓ '}
          {hint}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                           Tab Button                                */
/* ------------------------------------------------------------------ */

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150',
        active
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50',
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*                        Top Product Row                              */
/* ------------------------------------------------------------------ */

function TopProductRow({
  product,
  rank,
  highlight,
}: {
  product: DashboardTopProduct;
  rank: number;
  highlight: 'views' | 'inquiries';
}) {
  return (
    <li>
      <Link
        href={`/product/${product.slug}`}
        className="flex items-center gap-4 rounded-xl px-3 py-3 transition-all duration-150 hover:bg-ink-50"
      >
        <span className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
          rank === 1 ? 'bg-yellow-100 text-yellow-700' :
          rank === 2 ? 'bg-ink-100 text-ink-600' :
          rank === 3 ? 'bg-orange-100 text-orange-700' :
          'bg-ink-100 text-ink-500',
        )}>
          {rank}
        </span>
        <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-ink-100 shadow-sm">
          {product.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">{product.name}</p>
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <Badge tone={highlight === 'views' ? 'brand' : 'neutral'} dot>
            {product.viewCount.toLocaleString('en-IN')} views
          </Badge>
          <Badge tone={highlight === 'inquiries' ? 'brand' : 'neutral'} dot>
            {product.inquiryCount.toLocaleString('en-IN')} inquiries
          </Badge>
        </div>
      </Link>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*                       Recent Inquiry Row                            */
/* ------------------------------------------------------------------ */

const STATUS_TONE = {
  new: 'info',
  responded: 'success',
  closed: 'neutral',
} as const;

function RecentInquiryRow({ inquiry }: { inquiry: InquirySummary }) {
  return (
    <li>
      <Link
        href={`/seller/inquiries/${inquiry.id}`}
        className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-150 hover:bg-ink-50"
      >
        <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-ink-100 shadow-sm">
          {inquiry.product?.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={inquiry.product.primaryImageUrl}
              alt={inquiry.product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-ink-900">{inquiry.subject}</p>
            {inquiry.unreadForViewer && (
              <span className="size-2 shrink-0 rounded-full bg-brand-500 ring-2 ring-brand-100" aria-label="unread" />
            )}
          </div>
          <p className="truncate text-xs text-ink-500">
            From: <span className="font-medium text-ink-700">{inquiry.buyer.name}</span>
            {inquiry.product && <> · {inquiry.product.name}</>}
          </p>
          <p className="text-[11px] text-ink-400">
            {formatRelativeTime(inquiry.lastMessageAt)} · {inquiry.messageCount} message
            {inquiry.messageCount === 1 ? '' : 's'}
          </p>
        </div>

        <Badge tone={STATUS_TONE[inquiry.status]} dot>{inquiry.status}</Badge>
      </Link>
    </li>
  );
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSeconds = Math.round((Date.now() - then) / 1000);
  if (diffSeconds < 60) return 'just now';
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
