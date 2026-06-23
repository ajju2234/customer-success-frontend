import { AxiosError } from "axios";

import { api } from "./axios";
import {
  AuthResponse,
  Customer,
  CustomerStatus,
  DashboardMetrics,
  Insight,
  Interaction,
  Page,
  User,
} from "./types";

export function apiError(err: unknown, fallback = "Something went wrong"): string {
  const e = err as AxiosError<{ detail?: unknown }>;
  // No HTTP response = network/CORS/timeout — show a friendly message, not "Network Error".
  if (e?.code === "ERR_NETWORK" || (e && !e.response)) {
    return "Unable to reach the server. Please check your connection and try again.";
  }
  const detail = e?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0] as { msg?: string };
    return first?.msg || fallback;
  }
  return fallback;
}

// ---- auth ----
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post<AuthResponse>("/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),
  refresh: () => api.post<AuthResponse>("/auth/refresh", {}).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  forgotPassword: (email: string) =>
    api
      .post<{ message: string; reset_token: string | null }>("/auth/forgot-password", { email })
      .then((r) => r.data),
  resetPassword: (token: string, new_password: string) =>
    api.post("/auth/reset-password", { token, new_password }).then((r) => r.data),
};

// ---- customers ----
export interface CustomerFilters {
  page?: number;
  limit?: number;
  status?: CustomerStatus | "";
  q?: string;
}
export const customersApi = {
  list: (f: CustomerFilters) =>
    api
      .get<Page<Customer>>("/customers", {
        params: {
          page: f.page ?? 1,
          limit: f.limit ?? 20,
          status: f.status || undefined,
          q: f.q || undefined,
        },
      })
      .then((r) => r.data),
  get: (id: string) => api.get<Customer>(`/customers/${id}`).then((r) => r.data),
  create: (data: Partial<Customer>) =>
    api.post<Customer>("/customers", data).then((r) => r.data),
  update: (id: string, data: Partial<Customer>) =>
    api.patch<Customer>(`/customers/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/customers/${id}`).then((r) => r.data),
};

// ---- interactions ----
export interface InteractionFilters {
  page?: number;
  limit?: number;
  customer_id?: string;
  type?: string;
  sentiment?: string;
}
export const interactionsApi = {
  list: (f: InteractionFilters) =>
    api
      .get<Page<Interaction>>("/interactions", {
        params: {
          page: f.page ?? 1,
          limit: f.limit ?? 20,
          customer_id: f.customer_id || undefined,
          type: f.type || undefined,
          sentiment: f.sentiment || undefined,
        },
      })
      .then((r) => r.data),
  get: (id: string) => api.get<Interaction>(`/interactions/${id}`).then((r) => r.data),
  create: (data: {
    customer_id: string;
    type: string;
    title: string;
    notes?: string;
    meeting_date: string;
  }) => api.post<Interaction>("/interactions", data).then((r) => r.data),
  update: (id: string, data: Partial<Interaction>) =>
    api.patch<Interaction>(`/interactions/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/interactions/${id}`).then((r) => r.data),
  regenerate: (id: string) =>
    api.post<Insight>(`/interactions/${id}/insights`).then((r) => r.data),
};

// ---- dashboard ----
export const dashboardApi = {
  metrics: () => api.get<DashboardMetrics>("/dashboard/metrics").then((r) => r.data),
};

// ---- users (admin only) ----
export const usersApi = {
  list: (f: { page?: number; limit?: number; q?: string; role?: string } = {}) =>
    api
      .get<Page<User>>("/users", {
        params: { page: f.page ?? 1, limit: f.limit ?? 20, q: f.q || undefined, role: f.role || undefined },
      })
      .then((r) => r.data),
  update: (id: string, data: { role?: string; is_active?: boolean }) =>
    api.patch<User>(`/users/${id}`, data).then((r) => r.data),
};
