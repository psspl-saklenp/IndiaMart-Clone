import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { ProductImageGallery } from '@/features/products/product-image-gallery';
import { getProduct } from '@/features/products/api';
import { InquiryDialog } from '@/features/inquiries/inquiry-dialog';

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

  const supplierName = product.seller.companyName ?? product.seller.name;
  const supplierHref = product.seller.slug ? `/supplier/${product.seller.slug}` : null;
  const priceFormatted = Number(product.price).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });
  const specEntries = product.specifications
    ? Object.entries(product.specifications)
    : [];

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left: gallery + dense info */}
        <div className="space-y-6 lg:col-span-7">
          <ProductImageGallery images={product.images} alt={product.name} />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={STOCK_TONE[product.stockStatus]}>
                {STOCK_LABEL[product.stockStatus]}
              </Badge>
              {product.seller.isVerifiedSupplier && <Badge tone="brand">Verified supplier</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{product.name}</h1>
            <p className="text-xs text-ink-500">
              By{' '}
              {supplierHref ? (
                <Link
                  href={supplierHref}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {supplierName}
                </Link>
              ) : (
                <span className="font-medium text-ink-700">{supplierName}</span>
              )}{' '}
              · {product.viewCount} views · {product.inquiryCount} inquiries
            </p>
          </div>

          <section className="rounded-md border border-ink-200 bg-white p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm text-ink-700">
              {product.description}
            </p>
          </section>

          {specEntries.length > 0 && (
            <section className="rounded-md border border-ink-200 bg-white">
              <h2 className="border-b border-ink-100 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
                Specifications
              </h2>
              <dl className="divide-y divide-ink-100 text-sm">
                {specEntries.map(([k, v]) => (
                  <div
                    key={k}
                    className="grid grid-cols-3 gap-3 px-4 py-2.5"
                  >
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="col-span-2 font-medium text-ink-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        {/* Right: sticky inquiry sidebar */}
        <aside className="space-y-4 lg:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-md border border-ink-200 bg-white p-4 shadow-[var(--shadow-card)]">
            <p className="text-[11px] uppercase tracking-wide text-ink-500">
              Latest price
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-brand-700">
                ₹{priceFormatted}
              </span>
              <span className="text-sm text-ink-500">/ {product.unit}</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              Min. order: {product.minOrderQty} {product.unit} · {product.currency}
            </p>

            <div className="mt-4 space-y-2">
              <InquiryDialog
                productId={product.id}
                productName={product.name}
                productUnit={product.unit}
                sellerId={product.seller.id}
                sellerName={supplierName}
                triggerLabel="Send inquiry"
                triggerClassName="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-card)] hover:bg-brand-700"
              />
              <InquiryDialog
                productId={product.id}
                productName={product.name}
                productUnit={product.unit}
                sellerId={product.seller.id}
                sellerName={supplierName}
                triggerLabel="Get latest price"
                triggerClassName="w-full rounded-md border border-brand-600 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                defaultSubject={`Latest price for ${product.name}`}
                defaultMessage={`Hi ${supplierName}, please share your latest price for ${product.name} (MOQ ${product.minOrderQty} ${product.unit}). Thank you.`}
              />
            </div>

            <p className="mt-3 text-center text-[11px] text-ink-500">
              Supplier typically responds within 24 hours.
            </p>
          </div>

          <div className="rounded-md border border-ink-200 bg-white p-4">
            <p className="text-[11px] uppercase tracking-wide text-ink-500">Supplier</p>
            <div className="mt-1 flex items-start justify-between gap-2">
              {supplierHref ? (
                <Link
                  href={supplierHref}
                  className="text-base font-semibold text-ink-900 hover:text-brand-700"
                >
                  {supplierName}
                </Link>
              ) : (
                <span className="text-base font-semibold text-ink-900">{supplierName}</span>
              )}
              {product.seller.isVerifiedSupplier && (
                <span className="flex-shrink-0 rounded-sm bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                  ✓ Verified
                </span>
              )}
            </div>
            {supplierHref && (
              <Link
                href={supplierHref}
                className="mt-3 inline-block text-xs font-medium text-brand-700 hover:underline"
              >
                View supplier profile →
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
