'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

import { useDebounce } from '@/hooks/use-debounce';
import { suggest } from '@/features/search/api';
import type { SuggestResponse } from '@/types/search';

interface Props {
  className?: string;
  placeholder?: string;
  buttonText?: string;
  formClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

type FlatSuggestion =
  | { kind: 'product'; href: string; label: string; sub: string; thumb: string | null }
  | { kind: 'supplier'; href: string; label: string; sub: string; verified: boolean }
  | { kind: 'category'; href: string; label: string; sub: string };

export function SearchBar({
  className = '',
  placeholder = 'Search products, suppliers, categories…',
  buttonText = 'Search',
  formClassName = 'flex w-full items-center overflow-hidden rounded-md border border-ink-200 bg-white text-sm focus-within:border-ink-400 h-9',
  inputClassName = 'flex-1 bg-transparent px-3 py-1.5 text-ink-900 placeholder:text-ink-400 focus:outline-none h-full',
  buttonClassName = 'bg-[var(--color-im-teal-600)] px-4 h-full text-xs font-semibold text-white hover:bg-[var(--color-im-teal-700)] transition-colors shrink-0',
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState(params.get('q') ?? '');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const debounced = useDebounce(value.trim(), 250);

  // Sync from URL when navigating between results pages.
  useEffect(() => {
    setValue(params.get('q') ?? '');
  }, [params]);

  const { data } = useQuery<SuggestResponse>({
    queryKey: ['suggest', debounced],
    queryFn: () => suggest(debounced),
    enabled: debounced.length >= 2,
    staleTime: 30_000,
  });

  const flat = useMemo<FlatSuggestion[]>(() => {
    if (!data) return [];
    return [
      ...data.products.map(
        (p): FlatSuggestion => ({
          kind: 'product',
          href: `/product/${p.slug}`,
          label: p.name,
          sub: `₹${Number(p.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })} / ${p.currency}`,
          thumb: p.primaryImageUrl,
        }),
      ),
      ...data.suppliers.map(
        (s): FlatSuggestion => ({
          kind: 'supplier',
          href: `/supplier/${s.slug}`,
          label: s.companyName ?? s.name,
          sub: 'Supplier',
          verified: s.isVerifiedSupplier,
        }),
      ),
      ...data.categories.map(
        (c): FlatSuggestion => ({
          kind: 'category',
          href: `/category/${c.slug}`,
          label: c.name,
          sub: c.parentSlug ? `in ${c.parentSlug}` : 'Category',
        }),
      ),
    ];
  }, [data]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIdx(-1);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [close]);

  function navigateAndClose(href: string) {
    close();
    router.push(href);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    if (activeIdx >= 0 && flat[activeIdx]) {
      navigateAndClose(flat[activeIdx].href);
      return;
    }
    close();
    const target = pathname.startsWith('/me') ? '/me/search' : '/search';
    router.push(`${target}?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || flat.length === 0) {
      if (e.key === 'ArrowDown' && flat.length === 0 && debounced.length >= 2) setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % flat.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === 'Escape') {
      close();
    }
  }

  const showDropdown =
    open && debounced.length >= 2 && (flat.length > 0 || (data && data.q === debounced));

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={onSubmit}
        role="search"
        className={formClassName}
      >
        <input
          type="search"
          role="combobox"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
          className={inputClassName}
        />
        <button
          type="submit"
          className={buttonClassName}
        >
          {buttonText}
        </button>
      </form>

      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-1 max-h-[70vh] overflow-y-auto rounded-md border border-ink-200 bg-white shadow-lg"
        >
          {flat.length === 0 ? (
            <p className="px-3 py-3 text-xs text-ink-500">No matches yet.</p>
          ) : (
            <>
              <SuggestionGroup
                title="Products"
                items={flat.filter((f) => f.kind === 'product')}
                renderRow={(s) => (
                  <ProductRow
                    label={s.label}
                    sub={s.sub}
                    thumb={'thumb' in s ? s.thumb : null}
                  />
                )}
                offset={0}
                activeIdx={activeIdx}
                onPick={navigateAndClose}
              />
              <SuggestionGroup
                title="Suppliers"
                items={flat.filter((f) => f.kind === 'supplier')}
                renderRow={(s) => (
                  <SupplierRow
                    label={s.label}
                    verified={'verified' in s ? s.verified : false}
                  />
                )}
                offset={flat.findIndex((f) => f.kind === 'supplier')}
                activeIdx={activeIdx}
                onPick={navigateAndClose}
              />
              <SuggestionGroup
                title="Categories"
                items={flat.filter((f) => f.kind === 'category')}
                renderRow={(s) => <CategoryRow label={s.label} sub={s.sub} />}
                offset={flat.findIndex((f) => f.kind === 'category')}
                activeIdx={activeIdx}
                onPick={navigateAndClose}
              />
              <div className="border-t border-ink-100 px-3 py-2 text-right">
                <Link
                  href={`${pathname.startsWith('/me') ? '/me/search' : '/search'}?q=${encodeURIComponent(value.trim())}`}
                  onClick={close}
                  className="text-xs font-medium text-brand-700 hover:underline"
                >
                  See all results →
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionGroup({
  title,
  items,
  renderRow,
  offset,
  activeIdx,
  onPick,
}: {
  title: string;
  items: FlatSuggestion[];
  renderRow: (s: FlatSuggestion) => React.ReactNode;
  offset: number;
  activeIdx: number;
  onPick: (href: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="border-b border-ink-100 last:border-b-0">
      <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
        {title}
      </p>
      <ul>
        {items.map((s, i) => {
          const globalIdx = offset + i;
          const isActive = globalIdx === activeIdx;
          return (
            <li key={s.href}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(s.href)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-ink-50 ${isActive ? 'bg-ink-50' : ''
                  }`}
              >
                {renderRow(s)}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProductRow({
  label,
  sub,
  thumb,
}: {
  label: string;
  sub: string;
  thumb: string | null;
}) {
  return (
    <>
      <div className="size-9 flex-shrink-0 overflow-hidden rounded bg-ink-100">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-ink-900">{label}</p>
        <p className="truncate text-xs text-ink-500">{sub}</p>
      </div>
    </>
  );
}

function SupplierRow({ label, verified }: { label: string; verified: boolean }) {
  return (
    <>
      <div className="flex size-9 flex-shrink-0 items-center justify-center rounded bg-brand-100 text-xs font-semibold text-brand-700">
        {label.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-ink-900">{label}</p>
        <p className="text-xs text-ink-500">
          Supplier {verified && <span className="ml-1 text-brand-600">✓ Verified</span>}
        </p>
      </div>
    </>
  );
}

function CategoryRow({ label, sub }: { label: string; sub: string }) {
  return (
    <>
      <div className="size-9 flex-shrink-0 rounded bg-ink-100" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-ink-900">{label}</p>
        <p className="truncate text-xs text-ink-500">{sub}</p>
      </div>
    </>
  );
}
