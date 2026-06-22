import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import customersReducer from "./customersSlice";
import dashboardReducer from "./dashboardSlice";
import interactionsReducer from "./interactionsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customersReducer,
    interactions: interactionsReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
