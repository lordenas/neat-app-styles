import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { baseApi } from "@/services/api/baseApi";
import "@/services/api/authApi";
import "@/services/api/apiKeysApi";
import "@/services/api/calculatorsApi";
import "@/services/api/calculationsApi";
import "@/services/api/subscriptionsApi";
import "@/services/api/embedApi";
import "@/services/api/leadsApi";
import "@/services/api/analyticsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
