import { api } from '@/lib/axios';
import type {
  ListSellersParams,
  PaginatedSellers,
  SellerProfile,
} from '@/types/catalog';
import type { MyProfile, UpdateMyProfilePayload } from '@/types/dashboard';

export async function listSellers(params: ListSellersParams = {}): Promise<PaginatedSellers> {
  const { data } = await api.get<PaginatedSellers>('/sellers', { params });
  return data;
}

export async function getSeller(slug: string): Promise<SellerProfile> {
  const { data } = await api.get<SellerProfile>(`/sellers/${slug}`);
  return data;
}

export async function getMyProfile(): Promise<MyProfile> {
  const { data } = await api.get<MyProfile>('/sellers/me');
  return data;
}

export async function updateMyProfile(
  payload: UpdateMyProfilePayload,
): Promise<MyProfile> {
  const { data } = await api.patch<MyProfile>('/sellers/me', payload);
  return data;
}
