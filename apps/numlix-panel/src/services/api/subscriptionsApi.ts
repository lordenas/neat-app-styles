import { baseApi } from "./baseApi";

export type PlanSlug = "free" | "pro_500" | "pro_1000" | "pro_5000";

export interface SubscriptionResponse {
  id?: string;
  plan: string;
  status?: string;
  currentPeriodEnd?: string | null;
  current_period_end?: string | null;
}

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCurrentSubscription: build.query<SubscriptionResponse, void>({
      query: () => ({ url: "/api/subscriptions/current" }),
      transformResponse: (raw: unknown) => {
        const r = (raw ?? {}) as Record<string, unknown>;
        return {
          id: r.id as string | undefined,
          plan: String(r.plan ?? "free"),
          status: r.status as string | undefined,
          currentPeriodEnd: (r.currentPeriodEnd ?? r.current_period_end) as string | null | undefined,
        };
      },
      providesTags: ["Subscription"],
    }),
    updatePlan: build.mutation<SubscriptionResponse, { plan: PlanSlug }>({
      query: (body) => ({ url: "/api/subscriptions/plan", method: "PATCH", body }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const { useGetCurrentSubscriptionQuery, useUpdatePlanMutation } = subscriptionsApi;
