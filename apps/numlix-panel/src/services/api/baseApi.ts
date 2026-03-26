import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";
import { getAccessToken, normalizeApiBaseUrlForBrowser, refreshSession, setAccessToken } from "@numlix/auth-shared";

const getBaseUrl = () =>
  normalizeApiBaseUrlForBrowser(import.meta.env.VITE_API_URL ?? "https://api.numlix.local");

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: "include",
  prepareHeaders(headers) {
    const token = getAccessToken();
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
    if (result.error?.status === 401 && !isAuthEndpoint(args)) {
      try {
        const refreshed = await refreshSession();
        setAccessToken(refreshed.accessToken);
        result = await baseQuery(args, api, extraOptions);
      } catch {
        setAccessToken(null);
      }
    }
    return result;
  }) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, Record<string, unknown>, FetchBaseQueryMeta>,
  endpoints: () => ({}),
  tagTypes: ["ApiKeys", "Calculators", "Calculator", "Calculations", "Subscription", "EmbedTokens", "Leads", "Analytics"],
});
