import Link from 'next/link';

import { ProductCard } from '@/components/product/product-card';
import { listProducts } from '@/features/products/api';

/**
 * Server component — fetches the 10 most-viewed products and renders them
 * in a responsive grid. No auth required (public endpoint).
 */
export async function HomeFeaturedProducts() {
  let products: Awaited<ReturnType<typeof listProducts>>['data'] = [];
  try {
    const result = await listProducts({ limit: 10, sort: 'viewCount', order: 'desc' });
    products = result.data;
  } catch {
    // Silently degrade
  }

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
        No products listed yet.{' '}
        <Link href="/register" className="font-medium text-brand-700 hover:underline">
          Be the first seller →
        </Link>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
