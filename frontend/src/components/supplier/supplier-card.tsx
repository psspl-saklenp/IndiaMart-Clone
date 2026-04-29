import Link from 'next/link';

import type { SellerSummary } from '@/types/catalog';

export function SupplierCard({ supplier }: { supplier: SellerSummary }) {
  const displayName = supplier.companyName ?? supplier.name;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('');

  const rating = Number(supplier.ratingAvg);
  const profileHref = `/supplier/${supplier.slug}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-ink-200 bg-white transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <Link href={profileHref} className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-brand-100 text-lg font-bold text-brand-700">
            {supplier.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={supplier.logoUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials || 'S'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-1.5">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink-900">
                {displayName}
              </p>
              {supplier.isVerifiedSupplier && (
                <span className="flex-shrink-0 rounded-sm bg-brand-50 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-700">
                  ✓ Verified
                </span>
              )}
            </div>
            {supplier.businessType && (
              <p className="mt-0.5 truncate text-[11px] text-ink-500">
                {supplier.businessType}
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-600">
          {rating > 0 ? (
            <span className="flex items-center gap-1 font-medium">
              <span className="text-sun-500">★</span>
              <span className="text-ink-900">{rating.toFixed(1)}</span>
              <span className="text-ink-500">({supplier.ratingCount})</span>
            </span>
          ) : (
            <span className="text-ink-400">No ratings yet</span>
          )}
          {supplier.establishedYear && (
            <span className="text-ink-500">Est. {supplier.establishedYear}</span>
          )}
        </div>
      </Link>

      <div className="grid grid-cols-2 border-t border-ink-100">
        <Link
          href={profileHref}
          className="px-3 py-2 text-center text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          View profile
        </Link>
        <Link
          href={profileHref}
          className="border-l border-ink-100 bg-brand-600 px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Send inquiry
        </Link>
      </div>
    </article>
  );
}
