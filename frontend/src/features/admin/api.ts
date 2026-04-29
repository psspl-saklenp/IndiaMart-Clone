import { api } from '@/lib/axios';
import type {
  AdminStats,
  AdminUserSummary,
  ListUsersParams,
  PaginatedAdminUsers,
  UpdateUserPayload,
} from '@/types/admin';

export async function getStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>('/admin/stats');
  return data;
}

export async function listUsers(params: ListUsersParams = {}): Promise<PaginatedAdminUsers> {
  const { data } = await api.get<PaginatedAdminUsers>('/admin/users', { params });
  return data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<AdminUserSummary> {
  const { data } = await api.patch<AdminUserSummary>(`/admin/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export async function setSupplierVerified(slug: string, isVerifiedSupplier: boolean): Promise<void> {
  await api.patch(`/admin/sellers/${slug}/verify`, { isVerifiedSupplier });
}

export async function moderateProduct(id: string, isActive: boolean): Promise<void> {
  await api.patch(`/admin/products/${id}/moderate`, { isActive });
}
