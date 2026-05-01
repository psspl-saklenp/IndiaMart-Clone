import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import * as authApi from '@/features/auth/api';
import { setAccessToken } from '@/lib/axios';
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegisterSellerPayload,
  UpgradeToSellerPayload,
} from '@/types/auth';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const loginThunk = createAsyncThunk<AuthUser, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload);
      setAccessToken(res.accessToken);
      return res.user;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Login failed');
    }
  },
);

export const registerThunk = createAsyncThunk<AuthUser, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.register(payload);
      setAccessToken(res.accessToken);
      return res.user;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Registration failed');
    }
  },
);

export const registerSellerThunk = createAsyncThunk<
  AuthUser,
  RegisterSellerPayload,
  { rejectValue: string }
>('auth/registerSeller', async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.registerSeller(payload);
    setAccessToken(res.accessToken);
    return res.user;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Seller registration failed');
  }
});

/**
 * Promotes the currently-authenticated buyer to a seller. The backend
 * re-issues a token pair (the JWT carries the role), so we swap the access
 * token and replace `state.user` with the freshly returned seller user.
 */
export const upgradeToSellerThunk = createAsyncThunk<
  AuthUser,
  UpgradeToSellerPayload,
  { rejectValue: string }
>('auth/upgradeToSeller', async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.upgradeToSeller(payload);
    setAccessToken(res.accessToken);
    return res.user;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Seller upgrade failed');
  }
});

/**
 * Hydrates `state.auth` from the backend if a refresh-token cookie is valid.
 * Called once at app startup (and after refresh) to know whether the user is logged in.
 */
export const hydrateThunk = createAsyncThunk<AuthUser | null, void>(
  'auth/hydrate',
  async () => {
    try {
      // Try to refresh first (uses the httpOnly cookie); if that succeeds we have an access token,
      // and we can call /auth/me. If refresh fails the user is unauthenticated.
      const tokens = await authApi.refresh();
      setAccessToken(tokens.accessToken);
      return await authApi.me();
    } catch {
      setAccessToken(null);
      return null;
    }
  },
);

export const logoutThunk = createAsyncThunk<void, void>('auth/logout', async () => {
  try {
    await authApi.logout();
  } finally {
    setAccessToken(null);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
    },
  },
  extraReducers: (builder) => {
    const handleAuthSuccess = (state: AuthState, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.status = 'authenticated';
      state.error = null;
    };

    const handleAuthFailure = (
      state: AuthState,
      action: PayloadAction<string | undefined, string, unknown, unknown>,
    ) => {
      state.user = null;
      state.status = 'error';
      state.error = action.payload ?? 'Authentication failed';
    };

    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, handleAuthSuccess)
      .addCase(loginThunk.rejected, handleAuthFailure)

      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, handleAuthSuccess)
      .addCase(registerThunk.rejected, handleAuthFailure)

      .addCase(registerSellerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerSellerThunk.fulfilled, handleAuthSuccess)
      .addCase(registerSellerThunk.rejected, handleAuthFailure)

      .addCase(upgradeToSellerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(upgradeToSellerThunk.fulfilled, handleAuthSuccess)
      .addCase(upgradeToSellerThunk.rejected, handleAuthFailure)

      .addCase(hydrateThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(hydrateThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.status = 'authenticated';
        } else {
          state.user = null;
          state.status = 'unauthenticated';
        }
        state.error = null;
      })
      .addCase(hydrateThunk.rejected, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
        state.error = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
