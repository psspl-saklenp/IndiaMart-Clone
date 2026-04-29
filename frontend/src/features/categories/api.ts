import { api } from '@/lib/axios';
import type { Category } from '@/types/catalog';

export async function listCategoryTree(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export async function getCategory(slug: string): Promise<Category> {
  const { data } = await api.get<Category>(`/categories/${slug}`);
  return data;
}
