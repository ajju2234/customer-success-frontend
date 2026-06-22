import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { tokenStore } from "./authToken";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  withCredentials: true, // send/receive the httpOnly refresh cookie
});

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, try a one-time refresh, then replay the original request.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${BASE}/api/v1/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const token = res.data.access_token as string;
    tokenStore.set(token);
    return token;
  } catch {
    tokenStore.set(null);
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const url = original?.url || "";

    const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/refresh");
    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      refreshing = refreshing || refreshAccessToken();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      tokenStore.triggerUnauthorized();
    }
    return Promise.reject(error);
  }
);
