import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiError, InteractionFilters, interactionsApi } from "@/lib/api";
import { Interaction } from "@/lib/types";

interface InteractionsState {
  items: Interaction[];
  total: number;
  page: number;
  limit: number;
  filters: InteractionFilters;
  current: Interaction | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
}

const initialState: InteractionsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  filters: { page: 1, limit: 10 },
  current: null,
  status: "idle",
  error: null,
};

export const fetchInteractions = createAsyncThunk(
  "interactions/fetch",
  async (filters: InteractionFilters, { rejectWithValue }) => {
    try {
      return await interactionsApi.list(filters);
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

export const fetchInteraction = createAsyncThunk(
  "interactions/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      return await interactionsApi.get(id);
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

export const createInteraction = createAsyncThunk(
  "interactions/create",
  async (
    data: { customer_id: string; type: string; title: string; notes?: string; meeting_date: string },
    { rejectWithValue }
  ) => {
    try {
      return await interactionsApi.create(data);
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

export const regenerateInsight = createAsyncThunk(
  "interactions/regenerate",
  async (id: string, { rejectWithValue }) => {
    try {
      const insight = await interactionsApi.regenerate(id);
      const fresh = await interactionsApi.get(id);
      return fresh;
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

export const deleteInteraction = createAsyncThunk(
  "interactions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await interactionsApi.remove(id);
      return id;
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

const interactionsSlice = createSlice({
  name: "interactions",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.status = "ready";
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string;
      })
      .addCase(fetchInteraction.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(regenerateInsight.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const { setFilters } = interactionsSlice.actions;
export default interactionsSlice.reducer;
