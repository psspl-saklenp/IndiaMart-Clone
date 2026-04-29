'use client';

import { useQuery } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { getStats } from '@/features/admin/api';

export function AdminDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getStats,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Admin overview</h1>
        <p className="mt-1 text-sm text-ink-500">
          Platform-wide metrics. Numbers refresh on every load.
        </p>
      </div>

      {isLoading && <p className="text-sm text-ink-500">Loading…</p>}
      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load stats'}
        </div>
      )}

      {data && (
        <>
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Users
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Kpi label="Total users" value={data.totalUsers} />
              <Kpi label="Buyers" value={data.totalBuyers} />
              <Kpi label="Sellers" value={data.totalSellers} />
              <Kpi
                label="Admins"
                value={data.totalAdmins}
                hint={`${data.last30dRegistrations} new in 30d`}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Catalog
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Kpi
                label="Products"
                value={data.totalProducts}
                hint={`${data.activeProducts} active`}
              />
              <Kpi label="Categories" value={data.totalCategories} />
              <Kpi
                label="Verified suppliers"
                value={data.verifiedSuppliers}
                hint={
                  data.totalSellers > 0
                    ? `${Math.round((data.verifiedSuppliers / data.totalSellers) * 100)}% of sellers`
                    : undefined
                }
              />
              <Kpi
                label="Inquiries"
                value={data.totalInquiries}
                hint={`${data.openInquiries} open · ${data.last30dInquiries} in 30d`}
              />
            </div>
          </section>

          <section className="rounded-lg border border-ink-200 bg-white p-5">
            <h2 className="text-base font-semibold text-ink-900">Quick links</h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs">
              <li>
                <Badge tone="brand">/admin/users to moderate accounts</Badge>
              </li>
              <li>
                <Badge tone="brand">/admin/sellers to verify suppliers</Badge>
              </li>
              <li>
                <Badge tone="brand">/admin/products to hide listings</Badge>
              </li>
              <li>
                <Badge tone="brand">/admin/categories to edit the tree</Badge>
              </li>
              <li>
                <Badge tone="brand">/admin/inquiries to monitor activity</Badge>
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-900">{value.toLocaleString('en-IN')}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}
