import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CategoryProductGrid } from '@/features/products/category-product-grid';
import { getCategory } from '@/features/categories/api';

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

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  let categoryName: string;
  try {
    const category = await getCategory(slug);
    categoryName = category.name;
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-ink-500">Category</p>
        <h1 className="text-3xl font-bold text-ink-900">{categoryName}</h1>
      </header>
      <CategoryProductGrid categorySlug={slug} />
    </div>
  );
}
