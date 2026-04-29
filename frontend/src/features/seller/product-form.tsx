'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { listCategoryTree } from '@/features/categories/api';
import { createProduct, updateProduct } from '@/features/products/api';
import { ProductImageManager } from './product-image-manager';
import type { Category, CreateProductPayload, Product, StockStatus } from '@/types/catalog';

interface Props {
  mode: 'create' | 'edit';
  product?: Product;
}

const STOCK_OPTIONS = [
  { value: 'in_stock', label: 'In stock' },
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'made_to_order', label: 'Made to order' },
];

export function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: categoryTree } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: listCategoryTree,
    staleTime: 5 * 60_000,
  });

  const flatCategories = useMemo(() => flattenCategories(categoryTree ?? []), [categoryTree]);
  const categoryOptions = flatCategories.map((c) => ({ value: c.id, label: c.label }));

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [categoryId, setCategoryId] = useState(product?.category.id ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [unit, setUnit] = useState(product?.unit ?? 'piece');
  const [minOrderQty, setMinOrderQty] = useState(String(product?.minOrderQty ?? 1));
  const [stockStatus, setStockStatus] = useState<StockStatus>(product?.stockStatus ?? 'in_stock');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [specsJson, setSpecsJson] = useState(
    product?.specifications ? JSON.stringify(product.specifications, null, 2) : '',
  );
  const [error, setError] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: createProduct,
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['my-products'] });
      router.replace(`/seller/products/${created.id}/edit`);
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: string; body: CreateProductPayload }) =>
      updateProduct(payload.id, payload.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-products'] }),
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    let specifications: Record<string, string> | undefined;
    if (specsJson.trim()) {
      try {
        const parsed = JSON.parse(specsJson);
        if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
          throw new Error('Specifications must be a JSON object');
        }
        specifications = Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, String(v)]),
        );
      } catch (err) {
        setError(`Invalid specifications JSON: ${err instanceof Error ? err.message : err}`);
        return;
      }
    }

    const payload: CreateProductPayload = {
      name: name.trim(),
      description: description.trim(),
      categoryId,
      price: Number(price),
      unit,
      minOrderQty: Number(minOrderQty),
      stockStatus,
      isActive,
      ...(specifications ? { specifications } : {}),
    };

    try {
      if (mode === 'create') {
        await createMut.mutateAsync(payload);
      } else if (product) {
        await updateMut.mutateAsync({ id: product.id, body: payload });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid grid-cols-1 gap-4 rounded-lg border border-ink-200 bg-white p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            name="name"
            label="Product name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={3}
            maxLength={220}
          />
        </div>
        <Select
          name="categoryId"
          label="Category"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
          placeholder="Select a category"
        />
        <Select
          name="stockStatus"
          label="Stock status"
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value as StockStatus)}
          options={STOCK_OPTIONS}
        />
        <Input
          name="price"
          label="Price (₹)"
          type="number"
          step="0.01"
          min={0}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          name="unit"
          label="Unit"
          required
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          hint="e.g. piece, kg, meter, dozen"
        />
        <Input
          name="minOrderQty"
          label="Min. order qty"
          type="number"
          min={1}
          required
          value={minOrderQty}
          onChange={(e) => setMinOrderQty(e.target.value)}
        />
        <label className="flex items-center gap-2 self-end text-sm text-ink-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 rounded border-ink-300"
          />
          Active (visible to buyers)
        </label>
        <div className="sm:col-span-2">
          <Textarea
            name="description"
            label="Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            name="specifications"
            label="Specifications (JSON object, optional)"
            value={specsJson}
            onChange={(e) => setSpecsJson(e.target.value)}
            rows={5}
            hint='Example: {"Material":"Steel","Bore":"17mm"}'
          />
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isPending}>
          {mode === 'create' ? 'Create product' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {mode === 'edit' && product && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink-900">Images</h2>
          <ProductImageManager product={product} />
        </section>
      )}

      {mode === 'create' && (
        <p className="rounded-md border border-dashed border-ink-200 bg-ink-50 px-3 py-3 text-xs text-ink-500">
          Images can be added once the product is saved. You&apos;ll be redirected to the edit
          screen automatically.
        </p>
      )}
    </form>
  );
}

interface FlatCategory {
  id: string;
  label: string;
}

function flattenCategories(tree: Category[], depth = 0, out: FlatCategory[] = []): FlatCategory[] {
  for (const cat of tree) {
    out.push({ id: cat.id, label: `${'  '.repeat(depth)}${cat.name}` });
    if (cat.children?.length) flattenCategories(cat.children, depth + 1, out);
  }
  return out;
}
