import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import type { SellerSummary } from '@/types/catalog';

export function SupplierCard({ supplier }: { supplier: SellerSummary }) {
  const initials = (supplier.companyName ?? supplier.name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('');

  return (
    <Link
      href={`/supplier/${supplier.slug}`}
      className="flex h-full flex-col gap-3 rounded-lg border border-ink-200 bg-white p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-brand-100 text-base font-semibold text-brand-700">
          {supplier.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={supplier.logoUrl}
              alt={supplier.companyName ?? supplier.name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials || 'S'
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">
            {supplier.companyName ?? supplier.name}
          </p>
          {supplier.businessType && (
            <p className="truncate text-xs text-ink-500">{supplier.businessType}</p>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 text-xs">
        {supplier.isVerifiedSupplier && <Badge tone="brand">Verified</Badge>}
        {Number(supplier.ratingAvg) > 0 && (
          <Badge tone="success">
            ★ {Number(supplier.ratingAvg).toFixed(1)} ({supplier.ratingCount})
          </Badge>
        )}
        {supplier.establishedYear && (
          <span className="text-ink-500">Since {supplier.establishedYear}</span>
        )}
      </div>
    </Link>
  );
}
