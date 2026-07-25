import { apiRequest } from "@/lib/api";

export type ApiFeedback = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

export async function submitFeedback(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ApiFeedback> {
  return apiRequest<ApiFeedback>("/feedback", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}
