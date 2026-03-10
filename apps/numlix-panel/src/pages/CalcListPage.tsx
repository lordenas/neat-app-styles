import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calculator, Trash2, ExternalLink, Pencil, Lock, Code2 } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { EmbedCodeModal } from "@/components/calc-list/EmbedCodeModal";
import type { CustomCalculator } from "@/types/custom-calc";
import type { PlanType } from "@/hooks/usePlan";

export interface CalcListPageProps {
  calcList: CustomCalculator[];
  plan: PlanType;
  planMeta: { label: string; color: string };
  planLoading: boolean;
  limits: { maxCalcs: number };
  isCalcLimitReached: boolean;
  embedCalc: CustomCalculator | null;
  upgradeOpen: boolean;
  onNew: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onOpenPlayer: (slug: string) => void;
  onEmbedOpen: (calc: CustomCalculator | null) => void;
  setUpgradeOpen: (open: boolean) => void;
}

export function CalcListPage({
  calcList,
  plan,
  planMeta,
  planLoading,
  limits,
  isCalcLimitReached,
  embedCalc,
  upgradeOpen,
  onNew,
  onDelete,
  onEdit,
  onOpenPlayer,
  onEmbedOpen,
  setUpgradeOpen,
}: CalcListPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Мои калькуляторы</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Все созданные вами пользовательские калькуляторы
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!planLoading && (
              <Badge variant="outline" className="gap-1.5 text-xs hidden sm:flex">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: planMeta.color }}
                />
                {planMeta.label}
                {limits.maxCalcs !== -1 && (
                  <span className="text-muted-foreground">
                    {calcList.length}/{limits.maxCalcs}
                  </span>
                )}
              </Badge>
            )}
            <Button className="gap-2" onClick={onNew} disabled={isCalcLimitReached && plan !== "free"}>
              {isCalcLimitReached ? (
                <><Lock className="h-4 w-4" />Лимит достигнут</>
              ) : (
                <><Plus className="h-4 w-4" />Новый</>
              )}
            </Button>
          </div>
        </div>

        {!planLoading && limits.maxCalcs !== -1 && calcList.length >= limits.maxCalcs && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/5 px-4 py-3">
            <p className="text-sm text-warning-foreground">
              <span className="font-semibold">Лимит достигнут.</span>{" "}
              Вы создали {calcList.length} из {limits.maxCalcs} калькуляторов на тарифе «{planMeta.label}».
            </p>
            <Button size="sm" variant="outline" onClick={() => setUpgradeOpen(true)} className="shrink-0">
              Апгрейд
            </Button>
          </div>
        )}

        {calcList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-2xl">
            <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">Нет калькуляторов</p>
            <p className="text-sm text-muted-foreground mb-6">Создайте первый пользовательский калькулятор</p>
            <Button onClick={onNew}>
              <Plus className="h-4 w-4 mr-2" />
              Создать
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {calcList.map((c) => (
              <div
                key={c.id}
                className="group flex items-center gap-4 px-4 py-3 rounded-xl border bg-card hover:border-primary/40 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calculator className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.fields.length} полей · {c.isPublic ? "Публичный" : "Приватный"}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Получить код" onClick={() => onEmbedOpen(c)} aria-label="Получить код">
                    <Code2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenPlayer(c.slug)} aria-label="Открыть в новой вкладке">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(c.id)} aria-label="Редактировать">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => onDelete(c.id)} aria-label="Удалить">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason={`На тарифе «${planMeta.label}» можно создать не более ${limits.maxCalcs} калькуляторов. Перейдите на следующий тариф для увеличения лимита.`}
        currentPlan={plan}
      />

      <EmbedCodeModal
        calc={embedCalc}
        open={!!embedCalc}
        onOpenChange={(v) => { if (!v) onEmbedOpen(null); }}
      />
    </div>
  );
}
