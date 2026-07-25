import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as authApi from "@/services/auth";
import type { ApiCustomer } from "@/services/types";
import { mergeGuestCart, fetchCart } from "./cartSlice";

interface AuthState {
  customer: ApiCustomer | null;
  accessToken: string | null;
  status: "idle" | "loading" | "authenticated" | "anonymous";
  error: string | null;
}

const initialState: AuthState = {
  customer: null,
  accessToken: null,
  status: "idle",
  error: null,
};

export const hydrateAuth = createAsyncThunk("auth/hydrate", async () => {
  const customer = authApi.getStoredCustomer();
  const accessToken = authApi.getAccessToken();
  if (!accessToken || !customer) {
    return { customer: null, accessToken: null };
  }
  try {
    const me = await authApi.me();
    return { customer: me, accessToken };
  } catch {
    try {
      const refreshed = await authApi.refresh();
      return { customer: refreshed.customer, accessToken: refreshed.access_token };
    } catch {
      authApi.clearAuth();
      return { customer: null, accessToken: null };
    }
  }
});

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      const tokens = await authApi.login(payload);
      try {
        await dispatch(mergeGuestCart()).unwrap();
      } catch {
        await dispatch(fetchCart());
      }
      return tokens;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    payload: { email: string; password: string; full_name: string; phone?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const tokens = await authApi.register(payload);
      try {
        await dispatch(mergeGuestCart()).unwrap();
      } catch {
        await dispatch(fetchCart());
      }
      return tokens;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Registration failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCustomer: (state, action: PayloadAction<ApiCustomer | null>) => {
      state.customer = action.payload;
      state.status = action.payload ? "authenticated" : "anonymous";
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.customer = action.payload.customer;
        state.accessToken = action.payload.accessToken;
        state.status = action.payload.customer ? "authenticated" : "anonymous";
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.customer = action.payload.customer;
        state.accessToken = action.payload.access_token;
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "anonymous";
        state.error = (action.payload as string) || "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.customer = action.payload.customer;
        state.accessToken = action.payload.access_token;
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "anonymous";
        state.error = (action.payload as string) || "Registration failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.customer = null;
        state.accessToken = null;
        state.status = "anonymous";
        state.error = null;
      });
  },
});

export const { setCustomer, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthCustomer = (state: { auth: AuthState }) => state.auth.customer;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.status === "authenticated" && !!state.auth.customer;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
