import { useAuth } from "@/hooks/useAuth";
import { useGetCurrentSubscriptionQuery } from "@/services/api/subscriptionsApi";
import { useListCalculatorsQuery } from "@/services/api/calculatorsApi";
import type { PlanSlug } from "@/services/api/subscriptionsApi";

export type PlanType = "free" | "basic" | "standard" | "pro";

export interface PlanLimits {
  maxCalcs: number; // -1 = unlimited
  maxPages: number; // -1 = unlimited
  canUseBranching: boolean;
  hasEmailNotifications: boolean;
  hasSmsNotifications: boolean;
  hasTelegramNotifications: boolean;
  hasChatSupport: boolean;
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxCalcs: 0,
    maxPages: 0,
    canUseBranching: false,
    hasEmailNotifications: false,
    hasSmsNotifications: false,
    hasTelegramNotifications: false,
    hasChatSupport: false,
  },
  basic: {
    maxCalcs: 5,
    maxPages: 2,
    canUseBranching: false,
    hasEmailNotifications: true,
    hasSmsNotifications: false,
    hasTelegramNotifications: true,
    hasChatSupport: false,
  },
  standard: {
    maxCalcs: 20,
    maxPages: 5,
    canUseBranching: true,
    hasEmailNotifications: true,
    hasSmsNotifications: false,
    hasTelegramNotifications: true,
    hasChatSupport: false,
  },
  pro: {
    maxCalcs: -1,
    maxPages: -1,
    canUseBranching: true,
    hasEmailNotifications: true,
    hasSmsNotifications: true,
    hasTelegramNotifications: true,
    hasChatSupport: true,
  },
};

/** Map backend plan slug to frontend PlanType */
function mapPlanSlugToType(slug: string): PlanType {
  const m: Record<string, PlanType> = {
    free: "free",
    pro_500: "basic",
    pro_1000: "standard",
    pro_5000: "pro",
  };
  return m[slug] ?? "free";
}

export const PLAN_META = {
  free:     { label: "Бесплатный", price: 0,  color: "hsl(var(--muted-foreground))" },
  basic:    { label: "Базовый",    price: 5,  color: "hsl(var(--info))" },
  standard: { label: "Стандарт",   price: 10, color: "hsl(var(--success))" },
  pro:      { label: "Про",        price: 20, color: "hsl(var(--warning))" },
} as const;

export interface Subscription {
  id: string;
  plan: PlanType;
  status: string;
  current_period_end: string | null;
}

export function usePlan() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const { data: subData, isLoading: subLoading } = useGetCurrentSubscriptionQuery(undefined, { skip: !isAuthenticated });
  const { data: calculators = [] } = useListCalculatorsQuery(undefined, { skip: !isAuthenticated });

  const plan: PlanType = subData ? mapPlanSlugToType(subData.plan) : "free";
  const limits = PLAN_LIMITS[plan];
  const subscription: Subscription | null = subData
    ? {
        id: subData.id ?? "",
        plan,
        status: subData.status ?? "active",
        current_period_end: subData.currentPeriodEnd ?? subData.current_period_end ?? null,
      }
    : null;

  const calcCount = calculators.length;
  const loading = isAuthenticated && subLoading;
  const isCalcLimitReached = limits.maxCalcs !== -1 && calcCount >= limits.maxCalcs;
  const isPageLimitReached = (currentPageCount: number) =>
    limits.maxPages !== -1 && currentPageCount >= limits.maxPages;

  return {
    plan,
    limits,
    subscription,
    loading,
    calcCount,
    isCalcLimitReached,
    isPageLimitReached,
    refetch: () => {},
  };
}
