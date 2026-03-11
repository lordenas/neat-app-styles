import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";
import { setTokens, clearTokens, type AuthTokens } from "@/store/slices/authSlice";

type AuthStateShape = { auth: { tokens: AuthTokens | null } };

const getBaseUrl = () => {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string> })?.env;
  return viteEnv?.VITE_API_URL ?? "http://localhost:3000";
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders(headers, { getState }) {
    const token = (getState() as AuthStateShape).auth.tokens?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

function getRequestUrl(args: string | FetchArgs): string {
  if (typeof args === "string") return args;
  if (args && typeof args === "object" && "url" in args) return args.url as string;
  return "";
}
const isAuthEndpoint = (args: string | FetchArgs) =>
  /\/api\/auth\/(login|register|refresh)/.test(getRequestUrl(args));

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: (async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    const state = api.getState() as AuthStateShape;
    const refreshToken = state.auth.tokens?.refreshToken;

    if (result.error?.status === 401 && refreshToken && !isAuthEndpoint(args)) {
      const refreshResult = await baseQuery(
        {
          url: "/api/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data && typeof refreshResult.data === "object" && "accessToken" in refreshResult.data) {
        const data = refreshResult.data as AuthTokens;
        api.dispatch(setTokens(data));
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearTokens());
      }
    }
    return result;
  }) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, Record<string, unknown>, FetchBaseQueryMeta>,
  endpoints: () => ({}),
  tagTypes: ["ApiKeys", "Calculators", "Calculator", "Calculations", "Subscription", "EmbedTokens", "Leads", "Analytics"],
});
