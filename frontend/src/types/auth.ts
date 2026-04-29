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

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

export type RegisterResponse = LoginResponse;

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}
