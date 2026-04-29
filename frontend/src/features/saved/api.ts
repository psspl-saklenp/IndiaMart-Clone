import { api } from '@/lib/axios';
import type { Product } from '@/types/catalog';

export async function listSaved(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/saved-products');
  return data;
}

export async function listSavedIds(): Promise<string[]> {
  const { data } = await api.get<string[]>('/saved-products/ids');
  return data;
}

export async function saveProduct(productId: string): Promise<{ saved: true }> {
  const { data } = await api.post<{ saved: true }>('/saved-products', { productId });
  return data;
}

export async function unsaveProduct(productId: string): Promise<void> {
  await api.delete(`/saved-products/${productId}`);
}
