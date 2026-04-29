import { api } from '@/lib/axios';
import type {
  ListSellersParams,
  PaginatedSellers,
  SellerProfile,
} from '@/types/catalog';

export async function listSellers(params: ListSellersParams = {}): Promise<PaginatedSellers> {
  const { data } = await api.get<PaginatedSellers>('/sellers', { params });
  return data;
}

export async function getSeller(slug: string): Promise<SellerProfile> {
  const { data } = await api.get<SellerProfile>(`/sellers/${slug}`);
  return data;
}
