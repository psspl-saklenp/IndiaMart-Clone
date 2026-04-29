'use client';

import { useMemo, useState } from 'react';

import type { ProductImage } from '@/types/catalog';

export function ProductImageGallery({
  images,
  alt,
}: {
  images: ProductImage[];
  alt: string;
}) {
  const ordered = useMemo(() => {
    const sorted = [...images].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position,
    );
    return sorted;
  }, [images]);

  const [active, setActive] = useState<string | null>(ordered[0]?.id ?? null);
  const current = ordered.find((i) => i.id === active) ?? ordered[0] ?? null;

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-ink-200 bg-white text-sm text-ink-400">
        No images uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-lg border border-ink-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.altText ?? alt}
          className="h-full w-full object-contain"
        />
      </div>
      {ordered.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {ordered.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(img.id)}
              className={`size-16 overflow-hidden rounded-md border-2 ${
                img.id === current.id ? 'border-brand-500' : 'border-ink-200 hover:border-ink-300'
              }`}
              aria-label={`View image ${img.position + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText ?? alt}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
