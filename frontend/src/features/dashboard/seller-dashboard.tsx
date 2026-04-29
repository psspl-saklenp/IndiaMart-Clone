'use client';

import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Sparkline } from '@/components/charts/sparkline';
import { Badge } from '@/components/ui/badge';
import { getStats, getTimeseries, getTopProducts } from '@/features/dashboard/api';
import type { DashboardTopProduct } from '@/types/dashboard';

export function SellerDashboard() {
  const [topBy, setTopBy] = useState<'views' | 'inquiries'>('views');

  const [statsQ, tsQ, topQ] = useQueries({
    queries: [
      { queryKey: ['dash-stats'], queryFn: getStats },
      { queryKey: ['dash-ts', 30], queryFn: () => getTimeseries(30) },
      { queryKey: ['dash-top', topBy], queryFn: () => getTopProducts(topBy, 5) },
    ],
  });

  const stats = statsQ.data;
  const ts = tsQ.data;
  const top = topQ.data;

  const last30 = stats?.last30dInquiries ?? 0;
  const prev30 = stats?.prev30dInquiries ?? 0;
  const delta = last30 - prev30;
  const deltaPct = prev30 > 0 ? Math.round((delta / prev30) * 100) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">
          A snapshot of your catalog activity. Numbers refresh on every load.
        </p>
      </div>

      {statsQ.isError && (
        <ErrorBox msg={(statsQ.error as Error)?.message ?? 'Failed to load stats'} />
      )}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Active products" value={stats?.activeProducts} hint={stats ? `${stats.totalProducts} total` : ''} />
        <KpiCard
          label="Lifetime views"
          value={stats?.totalViews}
          hint={stats?.conversionRate != null ? `${(stats.conversionRate * 100).toFixed(1)}% conversion` : ''}
        />
        <KpiCard
          label="Lifetime inquiries"
          value={stats?.totalInquiries}
          hint={stats ? `${stats.openInquiries} open · ${stats.respondedInquiries} responded` : ''}
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
        />
      </section>

      <section className="rounded-lg border border-ink-200 bg-white p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-ink-900">Inquiries received · last 30 days</h2>
          {tsQ.data && (
            <span className="text-xs text-ink-500">
              {tsQ.data.reduce((acc, p) => acc + p.count, 0)} total
            </span>
          )}
        </div>
        {tsQ.isLoading && <p className="text-sm text-ink-500">Loading chart…</p>}
        {ts && (
          <Sparkline
            values={ts.map((p) => p.count)}
            labels={ts.map((p) => p.date)}
            height={120}
          />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-ink-900">Top products</h2>
          <div className="flex gap-1 rounded-md border border-ink-200 bg-ink-50 p-1 text-xs">
            <TabButton active={topBy === 'views'} onClick={() => setTopBy('views')}>
              By views
            </TabButton>
            <TabButton active={topBy === 'inquiries'} onClick={() => setTopBy('inquiries')}>
              By inquiries
            </TabButton>
          </div>
        </div>

        {topQ.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
        {top && top.length === 0 && (
          <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
            No products yet. List one to see it here.
          </p>
        )}
        {top && top.length > 0 && (
          <ul className="divide-y divide-ink-200 overflow-hidden rounded-lg border border-ink-200 bg-white">
            {top.map((product, i) => (
              <TopProductRow key={product.id} product={product} rank={i + 1} highlight={topBy} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  deltaTone,
}: {
  label: string;
  value: number | undefined;
  hint?: string;
  deltaTone?: 'success' | 'danger';
}) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-900">
        {value === undefined ? '—' : value.toLocaleString('en-IN')}
      </p>
      {hint && (
        <p
          className={`mt-1 text-xs ${
            deltaTone === 'danger'
              ? 'text-red-600'
              : deltaTone === 'success'
                ? 'text-emerald-600'
                : 'text-ink-500'
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

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
      className={`rounded px-3 py-1 transition-colors ${
        active ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-600 hover:text-ink-800'
      }`}
    >
      {children}
    </button>
  );
}

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
        className="flex items-center gap-4 px-4 py-3 hover:bg-ink-50"
      >
        <span className="size-6 flex-shrink-0 rounded-full bg-ink-100 text-center text-xs font-semibold leading-6 text-ink-700">
          {rank}
        </span>
        <div className="size-12 flex-shrink-0 overflow-hidden rounded-md bg-ink-100">
          {product.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900">{product.name}</p>
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <Badge tone={highlight === 'views' ? 'brand' : 'neutral'}>
            {product.viewCount.toLocaleString('en-IN')} views
          </Badge>
          <Badge tone={highlight === 'inquiries' ? 'brand' : 'neutral'}>
            {product.inquiryCount.toLocaleString('en-IN')} inquiries
          </Badge>
        </div>
      </Link>
    </li>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {msg}
    </div>
  );
}
