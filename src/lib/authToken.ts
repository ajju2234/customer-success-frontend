// In-memory access token holder. The access token is intentionally NOT persisted
// to localStorage (XSS-safe); it is re-obtained on load via the httpOnly refresh
// cookie through /auth/refresh.
let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (t: string | null) => {
    accessToken = t;
  },
  setOnUnauthorized: (cb: () => void) => {
    onUnauthorized = cb;
  },
  triggerUnauthorized: () => onUnauthorized?.(),
};
