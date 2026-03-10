import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, ArrowRight } from "lucide-react";
import { PlanType, PLAN_META } from "@/hooks/usePlan";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  currentPlan: PlanType;
}

const UPGRADE_MAP: Record<PlanType, PlanType | null> = {
  free: "basic",
  basic: "standard",
  standard: "pro",
  pro: null,
};

const PLAN_HIGHLIGHTS: Record<PlanType, string[]> = {
  free: [],
  basic:    ["5 калькуляторов", "2 страницы/форму", "Email и Telegram уведомления"],
  standard: ["20 калькуляторов", "5 страниц/форму", "Логические ветвления", "Все уведомления"],
  pro:      ["Без лимитов", "SMS-уведомления", "Чат с техподдержкой", "Всё из Стандарт"],
};

export function UpgradeModal({ open, onOpenChange, reason, currentPlan }: UpgradeModalProps) {
  const navigate = useNavigate();
  const targetPlan = UPGRADE_MAP[currentPlan] ?? "pro";
  const meta = PLAN_META[targetPlan];
  const highlights = PLAN_HIGHLIGHTS[targetPlan];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              Нужен апгрейд
            </Badge>
          </div>
          <DialogTitle className="text-lg">Достигнут лимит тарифа</DialogTitle>
          <DialogDescription className="text-sm">{reason}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-base">{meta.label}</span>
            <span className="font-bold text-lg">
              ${meta.price}<span className="text-sm font-normal text-muted-foreground">/мес</span>
            </span>
          </div>
          <ul className="space-y-1.5">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            className="flex-1 gap-1.5"
            onClick={() => { onOpenChange(false); navigate("/pricing"); }}
          >
            Перейти к тарифам <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
