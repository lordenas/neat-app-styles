import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListCalculatorsQuery, useDeleteCalculatorMutation } from "@/services/api/calculatorsApi";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { useToast } from "@/hooks/use-toast";
import { CalcListPage } from "./CalcListPage";
import type { CustomCalculator } from "@/types/custom-calc";
import { PLAN_META } from "@/hooks/usePlan";

export default function CalcListScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: calcList = [] } = useListCalculatorsQuery(undefined, { skip: !user });
  const [deleteCalculator] = useDeleteCalculatorMutation();
  const { plan, limits, isCalcLimitReached, loading: planLoading } = usePlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [embedCalc, setEmbedCalc] = useState<CustomCalculator | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteCalculator(id).unwrap();
      toast({ title: "Удалено" });
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const handleNew = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (isCalcLimitReached) {
      setUpgradeOpen(true);
      return;
    }
    navigate("/calc-builder");
  };

  const planMeta = PLAN_META[plan];

  return (
    <CalcListPage
      calcList={calcList}
      plan={plan}
      planMeta={planMeta}
      planLoading={planLoading}
      limits={limits}
      isCalcLimitReached={isCalcLimitReached}
      embedCalc={embedCalc}
      upgradeOpen={upgradeOpen}
      onNew={handleNew}
      onDelete={handleDelete}
      onEdit={(id) => navigate(`/calc-builder/${id}`)}
      onOpenPlayer={(slug) => window.open(`/c/${slug}`, "_blank")}
      onEmbedOpen={setEmbedCalc}
      setUpgradeOpen={setUpgradeOpen}
    />
  );
}
