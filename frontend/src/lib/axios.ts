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
//
// Recursion guard: if the failing request itself is `/auth/refresh` we must
// NOT try to refresh again — that would loop forever and, more practically,
// just means the refresh cookie is gone or invalid. We detect this by
// inspecting the request URL rather than tagging the request with a custom
// header, because a custom header would force a CORS preflight that the
// server's `allowedHeaders` whitelist doesn't accept — the preflight would
// then fail and the refresh would never even be sent, kicking the user to
// the login screen on every page reload.

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

const REFRESH_PATH = '/auth/refresh';

let refreshInFlight: Promise<string | null> | null = null;

function isRefreshRequest(cfg: AxiosRequestConfig | undefined): boolean {
  return Boolean(cfg?.url && cfg.url.endsWith(REFRESH_PATH));
}

async function performRefresh(): Promise<string | null> {
  try {
    // Plain axios call (NOT `api`) so the response interceptor below doesn't
    // recurse on this request. `withCredentials: true` is what actually
    // sends the refresh cookie back to the server.
    const res = await axios.post<{ accessToken: string }>(
      `${API_BASE_URL}${REFRESH_PATH}`,
      null,
      { withCredentials: true },
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

    if (
      status === 401 &&
      original &&
      !original._retried &&
      !isRefreshRequest(original)
    ) {
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
