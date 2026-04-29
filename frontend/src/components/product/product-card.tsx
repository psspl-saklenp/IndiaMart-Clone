import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { SaveHeart } from '@/features/saved/save-heart';
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
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-ink-200 bg-white transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-square w-full bg-ink-100">
        {primary ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.url}
            alt={primary.altText ?? product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-400">
            <span className="text-xs">No image yet</span>
          </div>
        )}
        <span className="absolute left-2 top-2">
          <Badge tone={STOCK_TONE[product.stockStatus]}>{STOCK_LABEL[product.stockStatus]}</Badge>
        </span>
        <SaveHeart productId={product.id} className="absolute right-2 top-2" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-ink-900">{product.name}</h3>

        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-brand-700">
            ₹{Number(product.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-ink-500">/ {product.unit}</span>
        </div>

        <p className="text-xs text-ink-500">
          MOQ: {product.minOrderQty} {product.unit}
        </p>

        <div className="mt-auto flex items-center gap-1.5 pt-1 text-xs">
          <span className="truncate text-ink-700">{supplier}</span>
          {product.seller.isVerifiedSupplier && <Badge tone="brand">Verified</Badge>}
        </div>
      </div>
    </Link>
  );
}
