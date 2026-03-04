import { useNavigate } from "react-router-dom";
import { loadCalculators, deleteCalculator, CustomCalculator } from "@/types/custom-calc";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, Trash2, ExternalLink, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CalcList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [calcList, setCalcList] = useState<CustomCalculator[]>(() => loadCalculators());

  const handleDelete = (id: string) => {
    deleteCalculator(id);
    setCalcList(loadCalculators());
    toast({ title: "Удалено" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Мои калькуляторы</h1>
            <p className="text-sm text-muted-foreground mt-1">Все созданные вами пользовательские калькуляторы</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/calc-builder")}>
            <Plus className="h-4 w-4" />
            Новый
          </Button>
        </div>

        {calcList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-2xl">
            <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">Нет калькуляторов</p>
            <p className="text-sm text-muted-foreground mb-6">Создайте первый пользовательский калькулятор</p>
            <Button onClick={() => navigate("/calc-builder")}>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(`/c/${c.slug}`, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigate(`/calc-builder/${c.id}`)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
