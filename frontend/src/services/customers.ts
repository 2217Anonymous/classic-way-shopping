import { apiRequest } from "@/lib/api";
import { storeAuth, getAccessToken, getRefreshToken } from "@/services/auth";
import type { ApiCustomer } from "./types";

export async function updateProfile(payload: {
  full_name?: string;
  phone?: string | null;
}): Promise<ApiCustomer> {
  const customer = await apiRequest<ApiCustomer>("/customers/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const access = getAccessToken();
  const refresh = getRefreshToken();
  if (access && refresh) {
    storeAuth({
      access_token: access,
      refresh_token: refresh,
      token_type: "bearer",
      customer,
    });
  }
  return customer;
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/customers/me/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
