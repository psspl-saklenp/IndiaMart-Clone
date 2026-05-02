import { api } from '@/lib/axios';
import type {
  ListSellersParams,
  PaginatedSellers,
  SellerProfile,
} from '@/types/catalog';
import type {
  KnownSellerLookup,
  MyProfile,
  UpdateMyProfilePayload,
} from '@/types/dashboard';

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

/**
 * Buyer-facing "Know Your Seller" lookup — hits the authenticated
 * `/sellers/lookup` endpoint with a partial name/email match and returns
 * the seller's contact details for verification.
 */
export async function lookupKnownSeller(q: string): Promise<KnownSellerLookup[]> {
  const { data } = await api.get<KnownSellerLookup[]>('/sellers/lookup', {
    params: { q },
  });
  return data;
}
