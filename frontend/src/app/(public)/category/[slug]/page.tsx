import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CategoryProductGrid } from '@/features/products/category-product-grid';
import { getCategory, listCategoryTree } from '@/features/categories/api';
import type { Category } from '@/types/catalog';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getCategory(slug);
    return { title: category.name };
  } catch {
    return { title: 'Category' };
  }
}

function findInTree(tree: Category[], targetSlug: string): Category | null {
  for (const c of tree) {
    if (c.slug === targetSlug) return c;
    if (c.children) {
      const hit = findInTree(c.children, targetSlug);
      if (hit) return hit;
    }
  }
  return null;
}

function findParent(tree: Category[], childSlug: string): Category | null {
  for (const c of tree) {
    if (c.children?.some((ch) => ch.slug === childSlug)) return c;
    if (c.children) {
      const hit = findParent(c.children, childSlug);
      if (hit) return hit;
    }
  }
  return null;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  let category;
  try {
    category = await getCategory(slug);
  } catch {
    notFound();
  }

  // Pull the tree so we can show sub-cat chips. If this fails we just render the grid.
  let siblings: Category[] = [];
  let parent: Category | null = null;
  let nodeInTree: Category | null = null;
  try {
    const tree = await listCategoryTree();
    nodeInTree = findInTree(tree, slug);
    if (nodeInTree?.children?.length) {
      siblings = nodeInTree.children;
    } else {
      // Leaf cat: show its siblings (parent's children) so users can hop sideways.
      parent = findParent(tree, slug);
      siblings = parent?.children ?? [];
    }
  } catch {
    // tree fetch failed; ignore.
  }

  return (
    <div className="space-y-6">
      <nav className="text-xs text-ink-500">
        <Link href="/" className="hover:text-ink-800">
          Home
        </Link>{' '}
        {parent && (
          <>
            /{' '}
            <Link href={`/category/${parent.slug}`} className="hover:text-ink-800">
              {parent.name}
            </Link>{' '}
          </>
        )}
        / <span className="text-ink-700">{category.name}</span>
      </nav>

      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-ink-500">Category</p>
        <h1 className="text-3xl font-bold text-ink-900">{category.name}</h1>
        {category.description && (
          <p className="max-w-3xl text-sm text-ink-600">{category.description}</p>
        )}
      </header>

      {siblings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {siblings.map((sib) => (
            <Link
              key={sib.id}
              href={`/category/${sib.slug}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                sib.slug === slug
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:text-ink-900'
              }`}
            >
              {sib.name}
            </Link>
          ))}
        </div>
      )}

      <CategoryProductGrid categorySlug={slug} />
    </div>
  );
}
