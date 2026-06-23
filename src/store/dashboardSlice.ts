import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiError, dashboardApi } from "@/lib/api";
import { DashboardMetrics } from "@/lib/types";
import { login, logout } from "./authSlice";

interface DashboardState {
  metrics: DashboardMetrics | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
}

const initialState: DashboardState = { metrics: null, status: "idle", error: null };

export const fetchMetrics = createAsyncThunk(
  "dashboard/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardApi.metrics();
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.status = "ready";
        state.metrics = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string;
      })
      .addCase(login.fulfilled, () => initialState)
      .addCase(logout.fulfilled, () => initialState);
  },
});

export default dashboardSlice.reducer;
