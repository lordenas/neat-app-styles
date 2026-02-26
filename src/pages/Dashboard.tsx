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
  Share2,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CopyButton } from "@/components/ui/copy-button";

interface SavedCalculation {
  id: string;
  title: string;
  calculator_type: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  created_at: string;
  share_token?: string | null;
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
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchCalculations();
  }, [user]);

  const fetchCalculations = async () => {
    const { data, error } = await supabase
      .from("saved_calculations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setCalculations(data as SavedCalculation[]);
    setLoading(false);
  };

  const deleteCalculation = async (id: string) => {
    const { error } = await supabase.from("saved_calculations").delete().eq("id", id);
    if (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить расчёт.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
    } else {
      setCalculations((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast({ title: "Удалено", description: "Расчёт удалён из истории.", variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
    }
  };

  const shareCalculation = async (calc: SavedCalculation) => {
    const token = calc.share_token || crypto.randomUUID();
    if (!calc.share_token) {
      const { error } = await supabase
        .from("saved_calculations")
        .update({ share_token: token } as any)
        .eq("id", calc.id);
      if (error) {
        toast({ title: "Ошибка", description: "Не удалось создать ссылку.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
        return;
      }
      setCalculations((prev) => prev.map((c) => c.id === calc.id ? { ...c, share_token: token } : c));
    }
    const url = `${window.location.origin}/shared/${token}`;
    await navigator.clipboard.writeText(url);
    toast({ title: "Ссылка скопирована", description: "Поделитесь ею с кем угодно.", variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else if (n.size < 3) n.add(id);
      return n;
    });
  };

  const handleCompare = () => {
    navigate(`/compare?ids=${[...selected].join(",")}`);
  };

  const selectedCalcs = calculations.filter((c) => selected.has(c.id));
  const selectedTypes = new Set(selectedCalcs.map((c) => c.calculator_type));
  const mixedTypes = selectedTypes.size > 1;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) return null;

  const displayName = user.user_metadata?.display_name || user.email;

  return (
    <>
      <Helmet><title>Личный кабинет — CalcHub</title></Helmet>
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
              <LogOut className="h-4 w-4" /> Выйти
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
                <FileText className="h-5 w-5" /> Сохранённые расчёты
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
                  <Button variant="outline" size="sm" onClick={() => navigate("/credit-calculator")} className="gap-1.5">
                    <Calculator className="h-4 w-4" /> Перейти к калькулятору
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {calculations.map((calc) => {
                  const isSelected = selected.has(calc.id);
                  const firstSelectedType = selectedCalcs[0]?.calculator_type;
                  const isTypeMismatch = isSelected && mixedTypes;
                  return (
                   <Card key={calc.id} className={`transition-shadow hover:shadow-md ${isSelected && !isTypeMismatch ? "ring-2 ring-primary/40" : ""} ${isTypeMismatch ? "ring-2 ring-[hsl(var(--warning)/0.5)]" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selected.has(calc.id)}
                            onCheckedChange={() => toggleSelect(calc.id)}
                            disabled={!selected.has(calc.id) && selected.size >= 3}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <CardTitle className="text-base">{calc.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 text-xs">
                              <Clock className="h-3 w-3" />
                              {new Date(calc.created_at).toLocaleDateString("ru", {
                                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                              })}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {typeLabels[calc.calculator_type] || calc.calculator_type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shareCalculation(calc)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                            title="Поделиться"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          {calc.share_token && (
                            <CopyButton
                              value={`${window.location.origin}/shared/${calc.share_token}`}
                              variant="ghost"
                              size="icon-sm"
                            />
                          )}
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
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Floating compare button */}
        {selected.size >= 2 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
            {mixedTypes && (
              <div className="flex items-center gap-1.5 bg-warning/10 border border-warning/30 text-warning-foreground text-xs px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm">
                <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
                <span className="text-[hsl(var(--warning-foreground))]">Разные типы калькуляторов — сравнение может быть неточным</span>
              </div>
            )}
            <Button onClick={handleCompare} size="lg" className="shadow-lg gap-2" variant={mixedTypes ? "outline" : "default"}>
              <BarChart3 className="h-4 w-4" />
              Сравнить ({selected.size})
            </Button>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
