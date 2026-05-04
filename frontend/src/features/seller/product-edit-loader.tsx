'use client';

import { useQuery } from '@tanstack/react-query';

import { listMyProducts } from '@/features/products/api';
import { ProductForm } from './product-form';

export function ProductEditLoader({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-products'],
    queryFn: listMyProducts,
  });

  if (isLoading) return <p className="text-sm text-ink-500">Loading…</p>;
  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error instanceof Error ? error.message : 'Failed to load product'}
      </div>
    );
  }

  const product = data?.find((p) => p.id === id);
  if (!product) {
    return (
      <p className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
        Product not found, or it doesn&apos;t belong to you.
      </p>
    );
  }

  return <ProductForm mode="edit" product={product} />;
}
