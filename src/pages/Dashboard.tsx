import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
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
  ChevronDown,
  ChevronUp,
  Code2,
  Pencil,
  Plus,
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
import { useEmbedWidgets } from "@/hooks/useEmbedWidgets";
import { calculatorsByCategory } from "@/lib/calculators/calculator-data";

const allCalcs = Object.values(calculatorsByCategory).flat();
function calcName(id: string) {
  return allCalcs.find((c) => c.id === id)?.name ?? id;
}

interface SavedCalculation {
  id: string;
  title: string;
  calculator_type: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  created_at: string;
  share_token?: string | null;
}

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  credit:    { label: "Кредит",       icon: "💳", color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800" },
  mortgage:  { label: "Ипотека",      icon: "🏠", color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800" },
  deposit:   { label: "Вклад",        icon: "🏦", color: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800" },
  tax:       { label: "Налог",        icon: "📋", color: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800" },
  salary:    { label: "Зарплата",     icon: "💼", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800" },
  auto:      { label: "Авто",         icon: "🚗", color: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800" },
  legal:     { label: "Юридический",  icon: "⚖️", color: "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800" },
  business:  { label: "Бизнес",       icon: "📊", color: "bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800" },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? { label: type, icon: "🧮", color: "bg-muted text-muted-foreground border-border" };
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const { widgets, loading: widgetsLoading, deleteWidget } = useEmbedWidgets();

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

  const selectedCalcs = calculations.filter((c) => selected.has(c.id));
  const lockedType = selectedCalcs.length > 0 ? selectedCalcs[0].calculator_type : null;

  const toggleSelect = (calc: SavedCalculation) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(calc.id)) {
        n.delete(calc.id);
      } else if (n.size < 3) {
        if (lockedType === null || calc.calculator_type === lockedType) n.add(calc.id);
      }
      return n;
    });
  };

  const toggleGroupCollapse = (type: string) => {
    setCollapsedGroups((prev) => {
      const n = new Set(prev);
      if (n.has(type)) n.delete(type); else n.add(type);
      return n;
    });
  };

  const handleCompare = () => navigate(`/compare?ids=${[...selected].join(",")}`);
  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (authLoading || !user) return null;

  const displayName = user.user_metadata?.display_name || user.email;
  const groups = calculations.reduce<Record<string, SavedCalculation[]>>((acc, calc) => {
    if (!acc[calc.calculator_type]) acc[calc.calculator_type] = [];
    acc[calc.calculator_type].push(calc);
    return acc;
  }, {});
  const groupKeys = Object.keys(groups);

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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{calculations.length}</div>
                <div className="text-xs text-muted-foreground">Сохранённых расчётов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{groupKeys.length}</div>
                <div className="text-xs text-muted-foreground">Типов калькуляторов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{widgets.length}</div>
                <div className="text-xs text-muted-foreground">Embed-виджетов</div>
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

        {/* Embed Widgets */}
        <section className="py-10 sm:py-12 border-b border-border">
          <div className="container max-w-4xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Code2 className="h-5 w-5" /> Embed-виджеты
              </h2>
              <Link to="/embed-builder">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Новый виджет
                </Button>
              </Link>
            </div>

            {widgetsLoading ? (
              <div className="text-sm text-muted-foreground">Загрузка...</div>
            ) : widgets.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center space-y-3">
                  <Code2 className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  <div>
                    <p className="font-medium text-sm">Нет сохранённых виджетов</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Настройте калькулятор и вставьте его на свой сайт
                    </p>
                  </div>
                  <Link to="/embed-builder">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Создать виджет
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {widgets.map((widget) => (
                  <Card key={widget.id} className="group transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Code2 className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm truncate">{widget.name}</CardTitle>
                            <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {new Date(widget.updated_at).toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" })}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Link to={`/embed-builder?widgetId=${widget.id}`}>
                            <Button variant="ghost" size="icon-sm" title="Редактировать">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => deleteWidget(widget.id)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Удалить"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className="bg-muted px-2 py-0.5 rounded-full">
                          {calcName(widget.config.calculatorId)}
                        </span>
                        <span className="bg-muted px-2 py-0.5 rounded-full">{widget.config.currency}</span>
                        <span
                          className="px-2 py-0.5 rounded-full border text-[10px]"
                          style={{ backgroundColor: widget.config.primaryColor + "20", borderColor: widget.config.primaryColor + "40", color: widget.config.primaryColor }}
                        >
                          {widget.config.primaryColor}
                        </span>
                        <Badge variant={widget.config.plan === "pro" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {widget.config.plan === "pro" ? "Pro" : "Free"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Calculations */}
        <section className="py-10 sm:py-14">
          <div className="container max-w-4xl space-y-8">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" /> Сохранённые расчёты
            </h2>

            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Загрузка...</div>
            ) : calculations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <Calculator className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <div>
                    <p className="font-medium">Нет сохранённых расчётов</p>
                    <p className="text-sm text-muted-foreground mt-1">Сделайте расчёт в калькуляторе и сохраните результат</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/credit-calculator")} className="gap-1.5">
                    <Calculator className="h-4 w-4" /> Перейти к калькулятору
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {groupKeys.map((type) => {
                  const meta = getTypeMeta(type);
                  const groupCalcs = groups[type];
                  const isCollapsed = collapsedGroups.has(type);
                  const groupSelected = groupCalcs.filter((c) => selected.has(c.id)).length;
                  const isLocked = lockedType !== null && lockedType !== type;

                  return (
                    <div key={type} className={`space-y-3 transition-opacity ${isLocked ? "opacity-50" : ""}`}>
                      <button onClick={() => toggleGroupCollapse(type)} className="w-full flex items-center justify-between gap-3 group">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${meta.color}`}>
                            <span>{meta.icon}</span>{meta.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{groupCalcs.length} расчёт{groupCalcs.length === 1 ? "" : groupCalcs.length < 5 ? "а" : "ов"}</span>
                          {groupSelected > 0 && <Badge variant="default" size="sm">{groupSelected} выбрано</Badge>}
                          {isLocked && <span className="text-xs text-muted-foreground italic">недоступно для сравнения</span>}
                        </div>
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </span>
                      </button>

                      {!isCollapsed && (
                        <div className="grid gap-3">
                          {groupCalcs.map((calc) => {
                            const isSelected = selected.has(calc.id);
                            const isDisabled = !isSelected && (selected.size >= 3 || (lockedType !== null && calc.calculator_type !== lockedType));
                            return (
                              <Card key={calc.id} className={`transition-all ${isSelected ? "ring-2 ring-primary/50 shadow-sm" : ""} ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}>
                                <CardHeader className="pb-2">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <Checkbox checked={isSelected} onCheckedChange={() => !isDisabled && toggleSelect(calc)} disabled={isDisabled} className="mt-1" />
                                      <div className="space-y-1">
                                        <CardTitle className="text-base">{calc.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-xs">
                                          <Clock className="h-3 w-3" />
                                          {new Date(calc.created_at).toLocaleDateString("ru", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="sm" onClick={() => shareCalculation(calc)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" title="Поделиться">
                                        <Share2 className="h-4 w-4" />
                                      </Button>
                                      {calc.share_token && (
                                        <CopyButton value={`${window.location.origin}/shared/${calc.share_token}`} variant="ghost" size="icon-sm" />
                                      )}
                                      <Button variant="ghost" size="sm" onClick={() => deleteCalculation(calc.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    {Object.entries(calc.parameters).slice(0, 4).map(([key, val]) => (
                                      <span key={key} className="bg-muted px-2 py-0.5 rounded">{key}: {String(val)}</span>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {selected.size >= 2 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Button onClick={handleCompare} size="lg" className="shadow-lg gap-2">
              <BarChart3 className="h-4 w-4" /> Сравнить ({selected.size})
            </Button>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
