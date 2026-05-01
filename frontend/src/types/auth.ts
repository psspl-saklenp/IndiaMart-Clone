import type { Role } from './api';

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
  categoryId?: string;
  price?: number;
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

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

export type RegisterResponse = LoginResponse;
export type RegisterSellerResponse = LoginResponse;

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}
