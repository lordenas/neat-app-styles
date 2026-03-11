import { baseApi } from "./baseApi";

export interface DailyAnalyticsEvent {
  date?: string;
  count?: number;
}

export interface TopEventRow {
  type?: string;
  count?: number;
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDaily: build.query<DailyAnalyticsEvent[], void>({
      query: () => ({ url: "/api/analytics/daily" }),
      providesTags: ["Analytics"],
    }),
    getTop: build.query<TopEventRow[], void>({
      query: () => ({ url: "/api/analytics/top" }),
      providesTags: ["Analytics"],
    }),
    getMe: build.query<unknown[], void>({
      query: () => ({ url: "/api/analytics/me" }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const { useGetDailyQuery, useGetTopQuery, useGetMeQuery } = analyticsApi;
