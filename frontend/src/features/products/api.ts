import { api } from '@/lib/axios';
import type {
  AttachImagePayload,
  CreateProductPayload,
  ListProductsParams,
  PaginatedProducts,
  Product,
  ProductImage,
  UpdateProductPayload,
} from '@/types/catalog';

export async function listProducts(params: ListProductsParams = {}): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedProducts>('/products', { params });
  return data;
}

export async function listMyProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products/mine');
  return data;
}

export async function getProduct(slug: string): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${slug}`);
  return data;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await api.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function attachImage(
  productId: string,
  payload: AttachImagePayload,
): Promise<ProductImage> {
  const { data } = await api.post<ProductImage>(`/products/${productId}/images`, payload);
  return data;
}

export async function detachImage(productId: string, imageId: string): Promise<void> {
  await api.delete(`/products/${productId}/images/${imageId}`);
}
