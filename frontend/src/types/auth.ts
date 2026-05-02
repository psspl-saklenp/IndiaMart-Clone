import type { Role } from './api';
import type { StockStatus } from './catalog';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
  isVerified: boolean;
  lastLoginAt: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type RegisterRole = Exclude<Role, 'admin'>;

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: RegisterRole;
  phone?: string;
  companyName?: string;
  gstNumber?: string;
}

export interface SellerSignupProduct {
  name: string;
  description: string;
  price: number;
  categoryId?: string;
  specifications?: Record<string, string>;
  currency?: string;
  minOrderQty?: number;
  unit?: string;
  stockStatus?: StockStatus;
  isActive?: boolean;
}

export interface RegisterSellerPayload {
  email: string;
  password: string;
  name: string;
  phone: string;
  companyName: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panNumber?: string;
  products: SellerSignupProduct[];
}

/**
 * Promotes an already-authenticated buyer to a seller. Account fields are
 * intentionally absent because the user is identified by their JWT.
 */
export interface UpgradeToSellerPayload {
  city?: string;
  pincode?: string;
  panNumber?: string;
  gstNumber?: string;
  products: SellerSignupProduct[];
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

export type RegisterResponse = LoginResponse;
export type RegisterSellerResponse = LoginResponse;
export type UpgradeToSellerResponse = LoginResponse;

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}
