import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { ProductImageGallery } from '@/features/products/product-image-gallery';
import { getProduct } from '@/features/products/api';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    return {
      title: product.name,
      description: product.description.slice(0, 160),
    };
  } catch {
    return { title: 'Product' };
  }
}

const STOCK_LABEL = {
  in_stock: 'In stock',
  out_of_stock: 'Out of stock',
  made_to_order: 'Made to order',
} as const;

const STOCK_TONE = {
  in_stock: 'success',
  out_of_stock: 'danger',
  made_to_order: 'info',
} as const;

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  const supplier = product.seller.companyName ?? product.seller.name;

  return (
    <div className="space-y-8">
      <nav className="text-xs text-ink-500">
        <Link href="/" className="hover:text-ink-800">
          Home
        </Link>{' '}
        /{' '}
        <Link href={`/category/${product.category.slug}`} className="hover:text-ink-800">
          {product.category.name}
        </Link>{' '}
        / <span className="text-ink-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductImageGallery images={product.images} alt={product.name} />

        <div className="space-y-6">
          <div className="space-y-2">
            <Badge tone={STOCK_TONE[product.stockStatus]}>
              {STOCK_LABEL[product.stockStatus]}
            </Badge>
            <h1 className="text-3xl font-bold text-ink-900">{product.name}</h1>
          </div>

          <div className="rounded-lg border border-ink-200 bg-white p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-brand-700">
                ₹{Number(product.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm text-ink-500">/ {product.unit}</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              MOQ: {product.minOrderQty} {product.unit} · {product.currency}
            </p>

            <button
              type="button"
              disabled
              className="mt-4 w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white opacity-60"
              title="Inquiry system ships in Phase 6"
            >
              Send inquiry (Phase 6)
            </button>
          </div>

          <div className="rounded-lg border border-ink-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-ink-500">Supplier</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-base font-semibold text-ink-900">{supplier}</p>
              {product.seller.isVerifiedSupplier && <Badge tone="brand">Verified</Badge>}
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink-900">Description</h2>
            <p className="whitespace-pre-line text-sm text-ink-700">{product.description}</p>
          </section>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-ink-900">Specifications</h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-1 rounded-lg border border-ink-200 bg-white p-4 text-sm sm:grid-cols-2">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-ink-100 py-1.5 last:border-b-0">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="font-medium text-ink-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
