const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001/api/v1";

export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ??
  API_URL.replace(/\/api\/v1\/?$/, "") ??
  "http://localhost:8001";

export const TOKEN_KEY = "customer_access_token";
export const REFRESH_TOKEN_KEY = "customer_refresh_token";
export const CART_ID_KEY = "shopping_cart_id";
export const GUEST_CART_KEY = "shopping_guest_cart";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "/tshirts/IMG_5661.PNG";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    if (path.startsWith("/uploads")) return `${API_ORIGIN}${path}`;
    return path;
  }
  return `${API_ORIGIN}/${path}`;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCartId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_ID_KEY);
}

export function setCartId(id: string | null | undefined) {
  if (typeof window === "undefined") return;
  if (id == null || id === "") {
    localStorage.removeItem(CART_ID_KEY);
    return;
  }
  localStorage.setItem(CART_ID_KEY, String(id));
}

export type ApiRequestOptions = RequestInit & {
  token?: string | null;
  cartId?: string | null;
  skipAuth?: boolean;
};

function extractErrorMessage(payload: unknown, status: number): string {
  if (!payload || typeof payload !== "object") {
    return `Request failed (${status})`;
  }
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "object" && item && "msg" in item
          ? String((item as { msg: unknown }).msg)
          : JSON.stringify(item)
      )
      .join(", ");
  }
  return `Request failed (${status})`;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, cartId, skipAuth, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (!(rest.body instanceof FormData) && !headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }

  const authToken = skipAuth ? null : (token ?? getStoredToken());
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const resolvedCartId = cartId === undefined ? getCartId() : cartId;
  if (resolvedCartId != null && resolvedCartId !== "") {
    headers.set("X-Cart-Id", String(resolvedCartId));
  }

  const response = await fetch(`${API_URL}${path}`, { ...rest, headers });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(extractErrorMessage(payload, response.status), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function buildQuery(params: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
