'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  createCategory,
  deleteCategory,
  listCategoryTree,
  updateCategory,
  type CreateCategoryPayload,
} from '@/features/categories/api';
import type { Category } from '@/types/catalog';

interface FlatRow {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  depth: number;
}

function flatten(tree: Category[], depth = 0, out: FlatRow[] = []): FlatRow[] {
  for (const c of tree) {
    out.push({ id: c.id, slug: c.slug, name: c.name, parentId: c.parentId, depth });
    if (c.children?.length) flatten(c.children, depth + 1, out);
  }
  return out;
}

export function AdminCategories() {
  const qc = useQueryClient();
  const treeQ = useQuery({ queryKey: ['categories-tree'], queryFn: listCategoryTree });

  const flat = useMemo(() => flatten(treeQ.data ?? []), [treeQ.data]);

  const [newName, setNewName] = useState('');
  const [newParent, setNewParent] = useState('');

  const createMut = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => {
      setNewName('');
      setNewParent('');
      qc.invalidateQueries({ queryKey: ['categories-tree'] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories-tree'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories-tree'] }),
  });

  function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newName.trim()) return;
    createMut.mutate({
      name: newName.trim(),
      ...(newParent ? { parentId: newParent } : {}),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Categories</h1>
        <p className="mt-1 text-sm text-ink-500">
          Add, rename or remove categories. Slugs are generated automatically and stay immutable.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="grid grid-cols-1 gap-3 rounded-lg border border-ink-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <Input
          name="newName"
          label="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
          minLength={2}
          maxLength={160}
        />
        <Select
          name="newParent"
          label="Parent (optional)"
          value={newParent}
          onChange={(e) => setNewParent(e.target.value)}
          options={[
            { value: '', label: 'Top-level' },
            ...flat
              .filter((r) => r.depth === 0)
              .map((r) => ({ value: r.id, label: r.name })),
          ]}
        />
        <Button type="submit" loading={createMut.isPending}>
          Add
        </Button>
        {createMut.isError && (
          <p className="col-span-full rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
            {createMut.error instanceof Error ? createMut.error.message : 'Create failed'}
          </p>
        )}
      </form>

      {treeQ.isLoading && <p className="text-sm text-ink-500">Loading…</p>}

      {flat.length > 0 && (
        <ul className="overflow-hidden rounded-lg border border-ink-200 bg-white">
          {flat.map((row, i) => (
            <CategoryRow
              key={row.id}
              row={row}
              isLast={i === flat.length - 1}
              onRename={(name) => updateMut.mutate({ id: row.id, name })}
              onDelete={() => {
                if (confirm(`Delete "${row.name}"?`)) deleteMut.mutate(row.id);
              }}
              busy={
                (updateMut.isPending && updateMut.variables?.id === row.id) ||
                (deleteMut.isPending && deleteMut.variables === row.id)
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryRow({
  row,
  isLast,
  onRename,
  onDelete,
  busy,
}: {
  row: FlatRow;
  isLast: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(row.name);

  const indentStyle = { paddingLeft: `${row.depth * 24 + 12}px` };

  return (
    <li
      className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
        isLast ? '' : 'border-b border-ink-100'
      }`}
    >
      <div className="min-w-0 flex-1" style={indentStyle}>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-64 rounded-md border border-ink-200 bg-white px-2 py-1 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <Button
              type="button"
              size="sm"
              loading={busy}
              onClick={() => {
                if (name.trim() && name.trim() !== row.name) onRename(name.trim());
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setName(row.name);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-ink-900">{row.name}</p>
            <p className="text-xs text-ink-500">/{row.slug}</p>
          </div>
        )}
      </div>
      {!editing && (
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(true)}>
            Rename
          </Button>
          <Button type="button" size="sm" variant="danger" loading={busy} onClick={onDelete}>
            Delete
          </Button>
        </div>
      )}
    </li>
  );
}
