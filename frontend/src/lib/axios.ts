import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/**
 * Access token holder. Lives in module memory (NOT localStorage) to dodge XSS-driven
 * token theft. Hydrated from /auth/me on first load and from /auth/refresh otherwise.
 * Phase 2 wires this up to the Redux auth slice.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  if (accessToken) {
    cfg.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return cfg;
});

// Lightweight error normalisation. Phase 2 will add 401-refresh logic.
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response) {
      const data = error.response.data;
      const message =
        (data && (data.message || data.error)) ||
        error.message ||
        `HTTP ${error.response.status}`;
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      return Promise.reject(new Error('Network error: no response received'));
    }
    return Promise.reject(error);
  },
);
