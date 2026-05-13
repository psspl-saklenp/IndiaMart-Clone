'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { getStats } from '@/features/admin/api';
import { cn } from '@/lib/utils';

export function AdminDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getStats,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Admin Overview</h1>
          <p className="mt-1 text-sm text-ink-500">
            Platform-wide metrics. Numbers refresh on every load.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-xl bg-brand-100 px-3 py-1.5 text-xs font-bold text-brand-800">
          <span className="size-2 rounded-full bg-brand-500 animate-pulse" aria-hidden />
          Live data
        </span>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl skeleton" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span aria-hidden>⚠️</span>
          {error instanceof Error ? error.message : 'Failed to load stats'}
        </div>
      )}

      {data && (
        <>
          {/* Users section */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg" aria-hidden>👥</span>
              <h2 className="text-sm font-bold uppercase tracking-widest text-ink-500">Users</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Kpi label="Total users" value={data.totalUsers} icon="👤" tone="brand" />
              <Kpi label="Buyers" value={data.totalBuyers} icon="🛒" tone="info" />
              <Kpi label="Sellers" value={data.totalSellers} icon="🏪" tone="success" />
              <Kpi
                label="Admins"
                value={data.totalAdmins}
                hint={`${data.last30dRegistrations} new in 30d`}
                icon="⚙️"
                tone="warning"
              />
            </div>
          </section>

          {/* Catalog section */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg" aria-hidden>📦</span>
              <h2 className="text-sm font-bold uppercase tracking-widest text-ink-500">Catalog</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Kpi
                label="Products"
                value={data.totalProducts}
                hint={`${data.activeProducts} active`}
                icon="📦"
                tone="brand"
              />
              <Kpi label="Categories" value={data.totalCategories} icon="🗂️" tone="info" />
              <Kpi
                label="Verified suppliers"
                value={data.verifiedSuppliers}
                hint={
                  data.totalSellers > 0
                    ? `${Math.round((data.verifiedSuppliers / data.totalSellers) * 100)}% of sellers`
                    : undefined
                }
                icon="✅"
                tone="success"
              />
              <Kpi
                label="Inquiries"
                value={data.totalInquiries}
                hint={`${data.openInquiries} open · ${data.last30dInquiries} in 30d`}
                icon="💬"
                tone="warning"
              />
            </div>
          </section>

          {/* Quick links */}
          <section className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-ink-100 bg-gradient-to-r from-ink-50 to-white px-5 py-3.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-brand-100 text-sm" aria-hidden>🔗</span>
              <h2 className="text-sm font-bold text-ink-900">Quick links</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { href: '/admin/users', icon: '👥', label: 'Manage users', desc: 'Promote, demote, verify accounts' },
                { href: '/admin/sellers', icon: '🏪', label: 'Verify suppliers', desc: 'Review and approve seller profiles' },
                { href: '/admin/products', icon: '📦', label: 'Moderate products', desc: 'Hide or approve product listings' },
                { href: '/admin/categories', icon: '🗂️', label: 'Edit categories', desc: 'Manage the category tree' },
                { href: '/admin/inquiries', icon: '💬', label: 'Monitor inquiries', desc: 'View all platform inquiries' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 transition-all duration-150 hover:border-brand-200 hover:bg-brand-50 hover:shadow-sm"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xl">
                    {link.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{link.label}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{link.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const KPI_TONE_STYLES = {
  brand: 'from-brand-50 to-white border-brand-100',
  info: 'from-sky-50 to-white border-sky-100',
  success: 'from-emerald-50 to-white border-emerald-100',
  warning: 'from-amber-50 to-white border-amber-100',
  neutral: 'from-ink-50 to-white border-ink-200',
};

function Kpi({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  hint?: string;
  icon?: string;
  tone?: keyof typeof KPI_TONE_STYLES;
}) {
  return (
    <div className={cn('rounded-xl border bg-gradient-to-br p-4 shadow-sm', KPI_TONE_STYLES[tone])}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink-500">{label}</p>
        {icon && <span className="text-lg" aria-hidden>{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-bold text-ink-900">{value.toLocaleString('en-IN')}</p>
      {hint && <p className="mt-1.5 text-xs font-medium text-ink-500">{hint}</p>}
    </div>
  );
}
