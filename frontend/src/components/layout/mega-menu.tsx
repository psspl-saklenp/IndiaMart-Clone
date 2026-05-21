'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useCategoryTree } from '@/features/categories/use-category-tree';

interface Props {
  variant?: 'public' | 'buyer';
}

export function MegaMenu({ variant = 'public' }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { data: categories } = useCategoryTree();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        aria-haspopup="true"
        aria-expanded={open}
        className={
          variant === 'buyer'
            ? "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-white/95 hover:bg-white/10 transition-all duration-150 shrink-0"
            : "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
        }
      >
        All categories
        <svg
          aria-hidden
          width={12}
          height={12}
          viewBox="0 0 12 12"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2.5 4.5l3.5 3 3.5-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && categories && categories.length > 0 && (
        <div
          role="menu"
          onMouseLeave={() => setOpen(false)}
          className="absolute left-0 top-full z-40 mt-1 w-[min(92vw,960px)] rounded-lg border border-ink-200 bg-white shadow-lg"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="block text-sm font-semibold text-ink-900 hover:text-brand-700"
                >
                  {cat.name}
                </Link>
                {cat.children && cat.children.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {cat.children.slice(0, 6).map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/category/${child.slug}`}
                          onClick={() => setOpen(false)}
                          className="text-xs text-ink-500 hover:text-ink-900"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
