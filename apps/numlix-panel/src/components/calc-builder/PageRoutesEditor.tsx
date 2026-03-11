import { CalcField, CalcPage, PageRoute, VisibilityConfig } from "@/types/custom-calc";
import { ConditionEditor } from "./ConditionEditor";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function nanoid(len = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

interface PageRoutesEditorProps {
  /** Текущая страница (источник переходов) */
  page: CalcPage;
  /** Все страницы (для выбора цели) */
  pages: CalcPage[];
  /** Все поля калькулятора (для условий) */
  fields: CalcField[];
  onChange: (routes: PageRoute[]) => void;
}

export function PageRoutesEditor({ page, pages, fields, onChange }: PageRoutesEditorProps) {
  const routes = page.routes ?? [];
  const otherPages = pages.filter((p) => p.id !== page.id);

  const addRoute = () => {
    const firstOther = otherPages[0];
    if (!firstOther) return;
    const newRoute: PageRoute = {
      id: nanoid(),
      condition: { rules: [], logic: "AND" },
      targetPageIndex: pages.findIndex((p) => p.id === firstOther.id),
    };
    onChange([...routes, newRoute]);
  };

  const updateRoute = (routeId: string, partial: Partial<PageRoute>) => {
    onChange(routes.map((r) => (r.id === routeId ? { ...r, ...partial } : r)));
  };

  const removeRoute = (routeId: string) => {
    onChange(routes.filter((r) => r.id !== routeId));
  };

  if (otherPages.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
        Добавьте ещё одну страницу, чтобы настраивать переходы.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {routes.length === 0 && (
        <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-md px-3 py-2 leading-snug">
          Нет переходов. Добавьте правило: «если поле = значение → перейти на страницу N».
        </p>
      )}

      {routes.map((route, idx) => (
        <div key={route.id} className="rounded-lg border bg-muted/20 p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Переход {idx + 1}
              </span>
              {(route.condition.rules.length > 0) && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {route.condition.rules.length} усл.
                </Badge>
              )}
            </div>
            <button
              onClick={() => removeRoute(route.id)}
              className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          {/* Target page selector */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Перейти на страницу
            </Label>
            <Select
              value={String(route.targetPageIndex)}
              onValueChange={(v) => updateRoute(route.id, { targetPageIndex: Number(v) })}
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pages.map((p, i) => (
                  p.id !== page.id && (
                    <SelectItem key={p.id} value={String(i)} className="text-xs">
                      <span className={cn(
                        "inline-flex items-center gap-1.5",
                      )}>
                        <span className="w-4 h-4 rounded text-[9px] font-bold bg-muted flex items-center justify-center">
                          {i + 1}
                        </span>
                        {p.title || `Страница ${i + 1}`}
                      </span>
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">
              Условие (если пусто — переходить всегда)
            </Label>
            <ConditionEditor
              visibility={route.condition}
              onChange={(v: VisibilityConfig | null) =>
                updateRoute(route.id, {
                  condition: v ?? { rules: [], logic: "AND" },
                })
              }
              otherFields={fields}
            />
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5 w-full"
        onClick={addRoute}
        disabled={otherPages.length === 0}
      >
        <PlusCircle className="h-3.5 w-3.5" />
        Добавить переход
      </Button>
    </div>
  );
}
