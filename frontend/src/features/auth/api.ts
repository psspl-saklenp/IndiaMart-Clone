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
  // The response interceptor in `lib/axios.ts` already detects calls to
  // `/auth/refresh` and skips its retry logic for them, so we don't need a
  // custom header here — which is good, because adding one would force a
  // CORS preflight that the server's `allowedHeaders` whitelist rejects.
  const { data } = await api.post<RefreshResponse>('/auth/refresh');
  return data;
}

export async function me(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
