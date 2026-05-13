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
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-white transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5">
      <Link href={profileHref} className="flex flex-1 flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 text-lg font-bold text-brand-700 shadow-sm">
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
              <p className="line-clamp-2 text-sm font-bold leading-snug text-ink-900 group-hover:text-brand-700 transition-colors">
                {displayName}
              </p>
            </div>
            {supplier.isVerifiedSupplier && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <span aria-hidden>✓</span> Verified Supplier
              </span>
            )}
            {supplier.businessType && (
              <p className="mt-1 truncate text-[11px] text-ink-500">
                {supplier.businessType}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-ink-50 px-3 py-2 text-[11px] text-ink-600">
          {rating > 0 ? (
            <span className="flex items-center gap-1 font-semibold">
              <span className="text-yellow-500">★</span>
              <span className="text-ink-900">{rating.toFixed(1)}</span>
              <span className="text-ink-500">({supplier.ratingCount} reviews)</span>
            </span>
          ) : (
            <span className="text-ink-400">No ratings yet</span>
          )}
          {supplier.establishedYear && (
            <span className="flex items-center gap-1 text-ink-500">
              <span aria-hidden>📅</span>
              Est. {supplier.establishedYear}
            </span>
          )}
        </div>
      </Link>

      {/* Action buttons */}
      <div className="grid grid-cols-2 border-t border-ink-100">
        <Link
          href={profileHref}
          className="px-3 py-2.5 text-center text-xs font-semibold text-brand-700 transition-all duration-150 hover:bg-brand-50"
        >
          View profile
        </Link>
        <Link
          href={profileHref}
          className="border-l border-ink-100 bg-gradient-to-r from-brand-600 to-brand-700 px-3 py-2.5 text-center text-xs font-semibold text-white transition-all duration-150 hover:from-brand-700 hover:to-brand-800"
        >
          Send inquiry
        </Link>
      </div>
    </article>
  );
}
