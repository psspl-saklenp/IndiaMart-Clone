import type { ApiMeta, Role } from './api';

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  role: Role;
  isVerified: boolean;
  phone: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface PaginatedAdminUsers {
  data: AdminUserSummary[];
  meta: ApiMeta;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: Role;
  verified?: boolean;
  q?: string;
}

export interface UpdateUserPayload {
  role?: Role;
  isVerified?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalAdmins: number;
  verifiedSuppliers: number;
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalInquiries: number;
  openInquiries: number;
  last30dInquiries: number;
  last30dRegistrations: number;
}
