import Link from 'next/link';

import { listSellers } from '@/features/sellers/api';
import type { SellerSummary } from '@/types/catalog';

/**
 * Server component — fetches verified suppliers and renders a grid of cards.
 * No auth required (public endpoint).
 */
export async function HomeFeaturedSuppliers() {
  let sellers: SellerSummary[] = [];
  try {
    const result = await listSellers({ limit: 8, verified: true });
    sellers = result.data;
    // If no verified sellers, fall back to any sellers
    if (sellers.length === 0) {
      const fallback = await listSellers({ limit: 8 });
      sellers = fallback.data;
    }
  } catch {
    // Silently degrade
  }

  if (sellers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
        No suppliers yet.{' '}
        <Link href="/register" className="font-medium text-brand-700 hover:underline">
          Register as a seller →
        </Link>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {sellers.map((seller) => (
        <SupplierCard key={seller.id} seller={seller} />
      ))}
    </div>
  );
}

function SupplierCard({ seller }: { seller: SellerSummary }) {
  const name = seller.companyName ?? seller.name;
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/supplier/${seller.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      {/* Logo / avatar */}
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-100 bg-brand-50 text-lg font-bold text-brand-700">
        {seller.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={seller.logoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900 group-hover:text-brand-700">
          {name}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          {seller.isVerifiedSupplier && (
            <span className="rounded-sm bg-brand-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-700">
              ✓ Verified
            </span>
          )}
          {seller.businessType && (
            <span className="text-[10px] text-ink-500">{seller.businessType}</span>
          )}
        </div>
        {Number(seller.ratingAvg) > 0 && (
          <p className="mt-0.5 text-[10px] text-amber-600">
            ★ {Number(seller.ratingAvg).toFixed(1)} ({seller.ratingCount})
          </p>
        )}
      </div>
    </Link>
  );
}
