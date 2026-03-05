import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { loadCalculators } from "@/types/custom-calc";

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
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("subscriptions" as any)
      .select("id, plan, status, current_period_end")
      .eq("user_id", user.id)
      .single();
    setSubscription((data as Subscription) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const plan: PlanType = (subscription?.plan as PlanType) ?? "free";
  const limits = PLAN_LIMITS[plan];

  const calcCount = loadCalculators().length;

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
    refetch: fetchSubscription,
  };
}
