'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { listCategoryTree } from '@/features/categories/api';
import { createRequirement } from '@/features/requirements/api';
import { useAuth } from '@/hooks/use-auth';
import type { Category } from '@/types/catalog';
import type { CreateRequirementPayload } from '@/types/engagement';

interface FlatCategory {
  id: string;
  label: string;
}

function flatten(tree: Category[], depth = 0, out: FlatCategory[] = []): FlatCategory[] {
  for (const c of tree) {
    out.push({ id: c.id, label: `${'  '.repeat(depth)}${c.name}` });
    if (c.children?.length) flatten(c.children, depth + 1, out);
  }
  return out;
}

export function PostRequirementForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const { isAuthenticated, status } = useAuth();

  const treeQ = useQuery({ queryKey: ['categories-tree'], queryFn: listCategoryTree });
  const flat = useMemo(() => flatten(treeQ.data ?? []), [treeQ.data]);

  // Guest gate — show login prompt before rendering the form
  if (status !== 'idle' && status !== 'loading' && !isAuthenticated) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <span className="text-4xl" aria-hidden>🔒</span>
        <h2 className="mt-3 text-lg font-bold text-amber-900">Login required</h2>
        <p className="mt-2 text-sm text-amber-700">
          You need to be logged in to post a buy requirement. It&apos;s free and takes less than a minute.
        </p>
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login?next=/requirements/new"
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-brand-400 bg-white px-6 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50"
          >
            Sign up free
          </Link>
        </div>
      </div>
    );
  }

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('piece');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: (payload: CreateRequirementPayload) => createRequirement(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-requirements'] });
      router.replace('/me/requirements');
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Post failed'),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!categoryId) {
      setError('Please pick a category.');
      return;
    }
    mut.mutate({
      title: title.trim(),
      categoryId,
      description: description.trim(),
      ...(quantity ? { quantity: Number(quantity) } : {}),
      ...(unit ? { unit } : {}),
      ...(expectedPrice ? { expectedPrice: Number(expectedPrice) } : {}),
      ...(city ? { locationCity: city.trim() } : {}),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-ink-200 bg-white p-5">
      <Input
        name="title"
        label="What are you looking for?"
        placeholder="e.g. 200 industrial bearings"
        required
        minLength={3}
        maxLength={220}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Select
        name="categoryId"
        label="Category"
        required
        options={flat.map((c) => ({ value: c.id, label: c.label }))}
        placeholder="Choose a category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      />

      <Textarea
        name="description"
        label="Describe your requirement"
        rows={5}
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        hint="Specs, lead time, packaging, target delivery date — the more detail the better."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          name="quantity"
          label="Quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <Input
          name="unit"
          label="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
        <Input
          name="expectedPrice"
          label="Target price ₹ (optional)"
          type="number"
          min={0}
          step="0.01"
          value={expectedPrice}
          onChange={(e) => setExpectedPrice(e.target.value)}
        />
      </div>

      <Input
        name="city"
        label="Location / city (optional)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={mut.isPending}>
          Post requirement
        </Button>
      </div>
    </form>
  );
}
