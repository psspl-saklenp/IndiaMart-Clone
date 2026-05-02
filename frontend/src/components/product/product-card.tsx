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
    <article className="group relative flex flex-col overflow-hidden rounded-md border border-ink-200 bg-white transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full bg-ink-100">
          {primary ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primary.url}
              alt={primary.altText ?? product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-400">
              <span className="text-xs">No image yet</span>
            </div>
          )}
          <span className="absolute left-2 top-2">
            <Badge tone={STOCK_TONE[product.stockStatus]}>{STOCK_LABEL[product.stockStatus]}</Badge>
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink-900">
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-base font-bold text-brand-700">
                ₹{Number(product.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-ink-500"> / {product.unit}</span>
            </div>
            <span className="text-[11px] text-ink-500">
              MOQ {product.minOrderQty}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 border-t border-ink-100 pt-2 text-[11px]">
            <span className="truncate font-medium text-ink-700">{supplier}</span>
            {product.seller.isVerifiedSupplier && (
              <span className="flex-shrink-0 rounded-sm bg-brand-50 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-700">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
      </Link>

      <Link
        href={`/product/${product.slug}`}
        className="block bg-brand-600 px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Send inquiry
      </Link>
    </article>
  );
}
