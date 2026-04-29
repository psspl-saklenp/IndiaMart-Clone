'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { attachImage, detachImage } from '@/features/products/api';
import { presignUpload, uploadFileToS3 } from '@/features/uploads/api';
import type { Product } from '@/types/catalog';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function ProductImageManager({ product }: { product: Product }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const detachMut = useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      detachImage(productId, imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-products'] }),
  });

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      setError(`Unsupported file type: ${file.type}. Use JPEG, PNG, WEBP, or GIF.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`);
      return;
    }

    setUploading(true);
    try {
      const presigned = await presignUpload({
        fileName: file.name,
        contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
        purpose: 'product-image',
      });

      const publicUrl = await uploadFileToS3(presigned, file);

      await attachImage(product.id, {
        s3Key: presigned.s3Key,
        url: publicUrl,
        isPrimary: product.images.length === 0, // first image becomes primary
        position: product.images.length,
        altText: product.name,
      });

      qc.invalidateQueries({ queryKey: ['my-products'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-dashed border-ink-300 bg-white p-4">
        <label className="flex cursor-pointer flex-col items-start gap-2 text-sm">
          <span className="font-medium text-ink-900">Add an image</span>
          <span className="text-xs text-ink-500">JPEG / PNG / WEBP / GIF, up to 5 MB.</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onPick}
            disabled={uploading}
            className="text-xs text-ink-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-brand-700 disabled:opacity-50"
          />
        </label>
        {uploading && <p className="mt-2 text-xs text-ink-500">Uploading…</p>}
        {error && (
          <p className="mt-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
            {error}
          </p>
        )}
      </div>

      {product.images.length === 0 ? (
        <p className="text-xs text-ink-500">No images yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {product.images.map((img) => (
            <li
              key={img.id}
              className="relative overflow-hidden rounded-md border border-ink-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.altText ?? product.name} className="aspect-square w-full object-cover" />
              {img.isPrimary && (
                <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                  Primary
                </span>
              )}
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="absolute right-1 top-1 h-7 px-2 text-[10px]"
                loading={
                  detachMut.isPending &&
                  detachMut.variables?.imageId === img.id
                }
                onClick={() =>
                  detachMut.mutate({ productId: product.id, imageId: img.id })
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
