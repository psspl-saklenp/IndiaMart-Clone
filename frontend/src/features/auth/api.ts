import { api } from '@/lib/axios';
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  RegisterPayload,
  RegisterResponse,
  RegisterSellerPayload,
  RegisterSellerResponse,
  UpgradeToSellerPayload,
  UpgradeToSellerResponse,
} from '@/types/auth';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>('/auth/register', payload);
  return data;
}

export async function registerSeller(
  payload: RegisterSellerPayload,
): Promise<RegisterSellerResponse> {
  const { data } = await api.post<RegisterSellerResponse>('/auth/register-seller', payload);
  return data;
}

export async function upgradeToSeller(
  payload: UpgradeToSellerPayload,
): Promise<UpgradeToSellerResponse> {
  const { data } = await api.post<UpgradeToSellerResponse>('/auth/upgrade-to-seller', payload);
  return data;
}

export async function refresh(): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>('/auth/refresh', null, {
    // Skip the response interceptor's auto-refresh logic on this endpoint to
    // avoid an infinite loop if the refresh itself returns 401.
    headers: { 'X-Skip-Refresh': '1' },
  });
  return data;
}

export async function me(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
