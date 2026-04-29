import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/product-card';
import { getSeller } from '@/features/sellers/api';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const seller = await getSeller(slug);
    return {
      title: seller.companyName ?? seller.name,
      description: seller.description?.slice(0, 160) ?? `Supplier profile for ${seller.companyName ?? seller.name}`,
    };
  } catch {
    return { title: 'Supplier' };
  }
}

export default async function SupplierProfilePage({ params }: Props) {
  const { slug } = await params;

  let seller;
  try {
    seller = await getSeller(slug);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      <nav className="text-xs text-ink-500">
        <Link href="/" className="hover:text-ink-800">
          Home
        </Link>{' '}
        / <span className="text-ink-700">Suppliers</span> /{' '}
        <span className="text-ink-700">{seller.companyName ?? seller.name}</span>
      </nav>

      <header className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 via-white to-ink-100">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex size-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-white text-2xl font-bold text-brand-700">
            {seller.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={seller.logoUrl}
                alt={seller.companyName ?? seller.name}
                className="h-full w-full object-cover"
              />
            ) : (
              (seller.companyName ?? seller.name).charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">
                {seller.companyName ?? seller.name}
              </h1>
              {seller.isVerifiedSupplier && <Badge tone="brand">Verified Supplier</Badge>}
              {Number(seller.ratingAvg) > 0 && (
                <Badge tone="success">
                  ★ {Number(seller.ratingAvg).toFixed(1)} ({seller.ratingCount} reviews)
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-600">
              {[
                seller.businessType,
                seller.establishedYear ? `Est. ${seller.establishedYear}` : null,
                `${seller.productCount} active product${seller.productCount === 1 ? '' : 's'}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            {seller.description && (
              <p className="mt-3 max-w-3xl text-sm text-ink-700">{seller.description}</p>
            )}
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink-900">Products</h2>
        {seller.products.length === 0 ? (
          <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
            This supplier hasn&apos;t listed any products yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {seller.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
