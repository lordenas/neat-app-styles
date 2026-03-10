import { configureStore } from "@reduxjs/toolkit";
import authReducer, { setTokens, clearTokens } from "./slices/authSlice";
import { loadStoredTokens, saveStoredTokens } from "./authStorage";
import { baseApi } from "@/services/api/baseApi";
import "@/services/api/authApi";
import "@/services/api/apiKeysApi";
import "@/services/api/calculatorsApi";
import "@/services/api/calculationsApi";
import "@/services/api/subscriptionsApi";
import "@/services/api/embedApi";
import "@/services/api/leadsApi";
import "@/services/api/analyticsApi";

const authPersistMiddleware =
  () =>
  (next: (a: { type: string; payload?: unknown }) => unknown) =>
  (action: { type: string; payload?: unknown }) => {
    const result = next(action);
    if (action.type === setTokens.type) {
      saveStoredTokens((action.payload as import("./slices/authSlice").AuthTokens | null) ?? null);
    }
    if (action.type === clearTokens.type) {
      saveStoredTokens(null);
    }
    return result;
  };

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  preloadedState: {
    auth: { tokens: loadStoredTokens() },
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authPersistMiddleware, baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
