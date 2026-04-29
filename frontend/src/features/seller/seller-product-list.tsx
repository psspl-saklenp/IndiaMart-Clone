'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteProduct, listMyProducts } from '@/features/products/api';

export function SellerProductList() {
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-products'],
    queryFn: listMyProducts,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-products'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">My products</h1>
        <Link href="/seller/products/new">
          <Button>+ New product</Button>
        </Link>
      </div>

      {isLoading && <p className="text-sm text-ink-500">Loading…</p>}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load products'}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-12 text-center">
          <p className="text-sm text-ink-500">You haven&apos;t listed any products yet.</p>
          <Link href="/seller/products/new" className="mt-3 inline-block">
            <Button>Create your first product</Button>
          </Link>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="divide-y divide-ink-200 overflow-hidden rounded-lg border border-ink-200 bg-white">
          {data.map((product) => {
            const primary =
              product.images.find((i) => i.isPrimary) ?? product.images[0] ?? null;
            return (
              <li key={product.id} className="flex items-center gap-4 p-4">
                <div className="size-16 flex-shrink-0 overflow-hidden rounded-md bg-ink-100">
                  {primary ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primary.url}
                      alt={primary.altText ?? product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-ink-400">
                      no img
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/product/${product.slug}`}
                      className="truncate text-sm font-semibold text-ink-900 hover:underline"
                    >
                      {product.name}
                    </Link>
                    {!product.isActive && <Badge tone="warning">Hidden</Badge>}
                  </div>
                  <p className="text-xs text-ink-500">
                    ₹
                    {Number(product.price).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}{' '}
                    / {product.unit} · {product.category.name} · {product.viewCount} views
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link href={`/seller/products/${product.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deleteMut.isPending && deleteMut.variables === product.id}
                    onClick={() => {
                      if (confirm(`Delete "${product.name}"?`)) deleteMut.mutate(product.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
