import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiError, authApi } from "@/lib/api";
import { tokenStore } from "@/lib/authToken";
import { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
}

const initialState: AuthState = { user: null, status: "idle", error: null };

export const login = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.login(data);
      tokenStore.set(res.access_token);
      return res.user;
    } catch (e) {
      return rejectWithValue(apiError(e, "Login failed"));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; password: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await authApi.register(data);
      tokenStore.set(res.access_token);
      return res.user;
    } catch (e) {
      return rejectWithValue(apiError(e, "Registration failed"));
    }
  }
);

// Re-establish the session on app load using the httpOnly refresh cookie.
export const loadSession = createAsyncThunk("auth/loadSession", async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.refresh();
    tokenStore.set(res.access_token);
    return res.user;
  } catch {
    return rejectWithValue("No session");
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout();
  } finally {
    tokenStore.set(null);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(loadSession.rejected, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      });

    for (const thunk of [login, register]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.user = action.payload;
          state.status = "authenticated";
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = "unauthenticated";
          state.error = (action.payload as string) || "Authentication failed";
        });
    }
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
