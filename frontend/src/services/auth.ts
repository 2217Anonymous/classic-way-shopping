import {
  apiRequest,
  REFRESH_TOKEN_KEY,
  TOKEN_KEY,
} from "@/lib/api";
import type { ApiCustomer, ApiTokenPair } from "./types";

const CUSTOMER_KEY = "customer_profile";

export function storeAuth(tokens: ApiTokenPair) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(tokens.customer));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_KEY);
}

export function getStoredCustomer(): ApiCustomer | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CUSTOMER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiCustomer;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function register(payload: {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
}): Promise<ApiTokenPair> {
  const tokens = await apiRequest<ApiTokenPair>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  storeAuth(tokens);
  return tokens;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<ApiTokenPair> {
  const tokens = await apiRequest<ApiTokenPair>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  storeAuth(tokens);
  return tokens;
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await apiRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refresh }),
        skipAuth: true,
      });
    }
  } finally {
    clearAuth();
  }
}

export async function me(): Promise<ApiCustomer> {
  return apiRequest<ApiCustomer>("/auth/me");
}

export async function refresh(): Promise<ApiTokenPair> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }
  const tokens = await apiRequest<ApiTokenPair>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
    skipAuth: true,
  });
  storeAuth(tokens);
  return tokens;
}
