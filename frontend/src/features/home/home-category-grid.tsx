import Link from 'next/link';

import { listCategoryTree } from '@/features/categories/api';
import type { Category } from '@/types/catalog';

// Category icon mapping — fallback emoji per category name keyword
const ICON_MAP: Record<string, string> = {
  electronics: '💡',
  textile: '🧵',
  machinery: '⚙️',
  chemical: '🧪',
  agriculture: '🌾',
  food: '🍎',
  furniture: '🪑',
  construction: '🏗️',
  automobile: '🚗',
  medical: '🏥',
  plastic: '♻️',
  metal: '🔩',
  paper: '📄',
  rubber: '⚫',
  sport: '⚽',
  toy: '🧸',
  jewel: '💎',
  leather: '👜',
  glass: '🪟',
  ceramic: '🏺',
};

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return '📦';
}

/**
 * Server component — fetches the category tree and renders a grid of
 * top-level categories. Each card links to /category/[slug].
 */
export async function HomeCategoryGrid() {
  let categories: Category[] = [];
  try {
    const tree = await listCategoryTree();
    // Show top-level categories only, up to 16
    categories = tree.slice(0, 16);
  } catch {
    // Silently degrade — the grid just won't render
  }

  if (categories.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
        Categories coming soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className="group flex flex-col items-center gap-2 rounded-xl border border-ink-200 bg-white p-3 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
        >
          {cat.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cat.iconUrl}
              alt=""
              className="size-10 object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-3xl" aria-hidden>
              {getCategoryIcon(cat.name)}
            </span>
          )}
          <span className="line-clamp-2 text-[11px] font-medium leading-tight text-ink-700 group-hover:text-brand-700">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
