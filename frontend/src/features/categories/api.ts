import { api } from '@/lib/axios';
import type { Category } from '@/types/catalog';

export interface CreateCategoryPayload {
  name: string;
  parentId?: string;
  description?: string;
  iconUrl?: string;
  position?: number;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export async function listCategoryTree(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export async function getCategory(slug: string): Promise<Category> {
  const { data } = await api.get<Category>(`/categories/${slug}`);
  return data;
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  const { data } = await api.post<Category>('/categories', payload);
  return data;
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
