import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  LogOut,
  Trash2,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckCircle2, XCircle } from "lucide-react";

interface SavedCalculation {
  id: string;
  title: string;
  calculator_type: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  credit: "Кредит",
  mortgage: "Ипотека",
  deposit: "Вклад",
  tax: "Налог",
  business: "Бизнес",
};

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCalculations();
    }
  }, [user]);

  const fetchCalculations = async () => {
    const { data, error } = await supabase
      .from("saved_calculations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCalculations(data as SavedCalculation[]);
    }
    setLoading(false);
  };

  const deleteCalculation = async (id: string) => {
    const { error } = await supabase.from("saved_calculations").delete().eq("id", id);
    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить расчёт.",
        variant: "destructive",
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      });
    } else {
      setCalculations((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: "Удалено",
        description: "Расчёт удалён из истории.",
        variant: "success",
        icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) {
    return null;
  }

  const displayName = user.user_metadata?.display_name || user.email;

  return (
    <>
      <Helmet>
        <title>Личный кабинет — CalcHub</title>
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-10 border-b border-border">
          <div className="container max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{displayName}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="py-6 border-b border-border bg-muted/30">
          <div className="container max-w-4xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{calculations.length}</div>
                <div className="text-xs text-muted-foreground">Сохранённых расчётов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Set(calculations.map((c) => c.calculator_type)).size}
                </div>
                <div className="text-xs text-muted-foreground">Типов калькуляторов</div>
              </div>
              <div className="text-center hidden sm:block">
                <div className="text-2xl font-bold">
                  {calculations.length > 0
                    ? new Date(calculations[0].created_at).toLocaleDateString("ru")
                    : "—"}
                </div>
                <div className="text-xs text-muted-foreground">Последний расчёт</div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculations */}
        <section className="py-10 sm:py-14">
          <div className="container max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Сохранённые расчёты
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Загрузка...</div>
            ) : calculations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <Calculator className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <div>
                    <p className="font-medium">Нет сохранённых расчётов</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Сделайте расчёт в калькуляторе и сохраните результат
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/credit-calculator")}
                    className="gap-1.5"
                  >
                    <Calculator className="h-4 w-4" />
                    Перейти к калькулятору
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {calculations.map((calc) => (
                  <Card key={calc.id} className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{calc.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs">
                            <Clock className="h-3 w-3" />
                            {new Date(calc.created_at).toLocaleDateString("ru", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {typeLabels[calc.calculator_type] || calc.calculator_type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCalculation(calc.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {Object.entries(calc.parameters).slice(0, 4).map(([key, val]) => (
                          <span key={key} className="bg-muted px-2 py-0.5 rounded">
                            {key}: {String(val)}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
