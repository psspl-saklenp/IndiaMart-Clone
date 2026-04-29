import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/**
 * Access token holder. Lives in module memory (NOT localStorage) to dodge XSS-driven
 * token theft. Hydrated from `/auth/refresh` (which reads the httpOnly refresh cookie)
 * at app startup and on demand when a 401 fires.
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

// ---- 401 refresh-token rotation ----------------------------------------------
// We intercept 401s, attempt a single refresh, then retry the original request.
// Concurrent 401s share the same in-flight refresh promise to avoid stampede.

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const res = await axios.post<{ accessToken: string }>(
      `${API_BASE_URL}/auth/refresh`,
      null,
      {
        withCredentials: true,
        headers: { 'X-Skip-Refresh': '1' },
      },
    );
    setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    const original = error.config as RetriableConfig | undefined;
    const skipRefresh =
      original?.headers && (original.headers['X-Skip-Refresh'] as string | undefined);

    if (status === 401 && original && !original._retried && !skipRefresh) {
      original._retried = true;

      const newToken = await (refreshInFlight ??= performRefresh().finally(() => {
        refreshInFlight = null;
      }));

      if (newToken) {
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` };
        return api.request(original);
      }
    }

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
