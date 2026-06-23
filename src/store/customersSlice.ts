import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiError, CustomerFilters, customersApi } from "@/lib/api";
import { Customer } from "@/lib/types";
import { login, logout } from "./authSlice";

interface CustomersState {
  items: Customer[];
  total: number;
  page: number;
  limit: number;
  filters: CustomerFilters;
  current: Customer | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
}

const initialState: CustomersState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  filters: { page: 1, limit: 10, status: "", q: "" },
  current: null,
  status: "idle",
  error: null,
};

export const fetchCustomers = createAsyncThunk(
  "customers/fetch",
  async (filters: CustomerFilters, { rejectWithValue }) => {
    try {
      return await customersApi.list(filters);
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

export const fetchCustomer = createAsyncThunk(
  "customers/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      return await customersApi.get(id);
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/create",
  async (data: Partial<Customer>, { rejectWithValue }) => {
    try {
      return await customersApi.create(data);
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/update",
  async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
    try {
      return await customersApi.update(id, data);
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await customersApi.remove(id);
      return id;
    } catch (e) {
      return rejectWithValue(apiError(e));
    }
  }
);

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = "ready";
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string;
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      // Clear data on auth change so one user never sees another's rows.
      .addCase(login.fulfilled, () => initialState)
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const { setFilters } = customersSlice.actions;
export default customersSlice.reducer;
