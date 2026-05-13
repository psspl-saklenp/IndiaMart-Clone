import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/catalog';

const STOCK_LABEL: Record<Product['stockStatus'], string> = {
  in_stock: 'In stock',
  out_of_stock: 'Out of stock',
  made_to_order: 'Made to order',
};

const STOCK_TONE: Record<Product['stockStatus'], 'success' | 'danger' | 'info'> = {
  in_stock: 'success',
  out_of_stock: 'danger',
  made_to_order: 'info',
};

export function ProductCard({ product }: { product: Product }) {
  const primary =
    product.images.find((i) => i.isPrimary) ?? product.images[0] ?? null;
  const supplier = product.seller.companyName ?? product.seller.name;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5">
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
          {primary ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primary.url}
              alt={primary.altText ?? product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-300">
              <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-xs">No image</span>
            </div>
          )}

          {/* Stock badge */}
          <span className="absolute left-2 top-2">
            <Badge tone={STOCK_TONE[product.stockStatus]} dot>
              {STOCK_LABEL[product.stockStatus]}
            </Badge>
          </span>

          {/* Verified badge */}
          {product.seller.isVerifiedSupplier && (
            <span className="absolute right-2 top-2">
              <Badge tone="brand" dot>Verified</Badge>
            </span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-3">
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink-900 group-hover:text-brand-700 transition-colors">
            {product.name}
          </h3>

          {/* Price row */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-brand-700">
                ₹{Number(product.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-ink-500">/ {product.unit}</span>
            </div>
            <span className="shrink-0 rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-600">
              MOQ {product.minOrderQty}
            </span>
          </div>

          {/* Supplier row */}
          <div className="flex items-center gap-1.5 border-t border-ink-100 pt-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[9px] font-bold text-brand-700">
              {supplier.charAt(0).toUpperCase()}
            </span>
            <span className="truncate text-[11px] font-medium text-ink-600">{supplier}</span>
          </div>
        </div>
      </Link>

      {/* CTA button */}
      <Link
        href={`/product/${product.slug}`}
        className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-brand-600 to-brand-700 px-3 py-2.5 text-center text-xs font-semibold text-white transition-all duration-150 hover:from-brand-700 hover:to-brand-800 group-hover:shadow-sm"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 4h12M2 8h8M2 12h5" />
        </svg>
        Send inquiry
      </Link>
    </article>
  );
}
