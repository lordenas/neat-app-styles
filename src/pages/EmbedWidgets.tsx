import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Code2, Plus, Pencil, Trash2, Clock, ExternalLink, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { useEmbedWidgets } from "@/hooks/useEmbedWidgets";
import { calculatorsByCategory } from "@/lib/calculators/calculator-data";

const allCalcs = Object.values(calculatorsByCategory).flat();
function calcName(id: string) {
  return allCalcs.find((c) => c.id === id)?.name ?? id;
}

export default function EmbedWidgets() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { widgets, loading, deleteWidget } = useEmbedWidgets();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  if (authLoading || !user) return null;

  return (
    <>
      <Helmet>
        <title>Мои виджеты — CalcHub</title>
        <meta name="description" content="Управляйте своими embed-виджетами: настройте калькулятор, получите код для вставки на сайт." />
      </Helmet>
      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-muted/30">
          <div className="container max-w-4xl py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Link to="/dashboard" className="hover:text-foreground transition-colors">Личный кабинет</Link>
                  <span>/</span>
                  <span className="text-foreground">Embed-виджеты</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Code2 className="h-6 w-6 text-primary" />
                  Embed-виджеты
                </h1>
                <p className="text-muted-foreground text-sm">
                  Встройте калькулятор на свой сайт — настройте внешний вид и получите готовый код
                </p>
              </div>
              <Link to="/embed-builder">
                <Button className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  Новый виджет
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container max-w-4xl py-10">
          {loading ? (
            <div className="text-sm text-muted-foreground">Загрузка...</div>
          ) : widgets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Code2 className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Нет сохранённых виджетов</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Создайте виджет, настройте его под дизайн вашего сайта и вставьте одной строкой кода
                  </p>
                </div>
                <Link to="/embed-builder">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Создать первый виджет
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{widgets.length} виджет{widgets.length === 1 ? "" : widgets.length < 5 ? "а" : "ов"}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {widgets.map((widget) => (
                  <Card key={widget.id} className="group hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="h-9 w-9 rounded-xl border shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: widget.config.primaryColor + "20", borderColor: widget.config.primaryColor + "40" }}
                          >
                            <Code2 className="h-4 w-4" style={{ color: widget.config.primaryColor }} />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm truncate">{widget.name}</CardTitle>
                            <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {new Date(widget.updated_at).toLocaleDateString("ru", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-muted text-xs px-2 py-0.5 rounded-full">
                          {calcName(widget.config.calculatorId)}
                        </span>
                        <span className="bg-muted text-xs px-2 py-0.5 rounded-full">
                          {widget.config.currency} · {widget.config.locale}
                        </span>
                        <Badge
                          variant={widget.config.plan === "pro" ? "default" : "secondary"}
                          className="text-[10px] px-1.5 py-0 h-5"
                        >
                          {widget.config.plan === "pro" ? "Pro" : "Free"}
                        </Badge>
                      </div>

                      {/* Usage counter */}
                      {widget.config.plan === "free" ? (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Zap className="h-3 w-3" />
                              Встраиваний в этом месяце
                            </span>
                            <span className={`font-mono font-medium tabular-nums ${widget.monthly_views >= 90 ? "text-destructive" : widget.monthly_views >= 70 ? "text-[hsl(var(--warning,38_92%_50%))]" : "text-foreground"}`}>
                              {widget.monthly_views} / 100
                            </span>
                          </div>
                          <Progress
                            value={widget.monthly_views}
                            max={100}
                            className="h-1.5"
                          />
                          {widget.monthly_views >= 90 && (
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] text-destructive">Лимит почти исчерпан</p>
                              <Link to="/embed-builder" className="text-[11px] text-primary flex items-center gap-1 hover:underline">
                                <Crown className="h-3 w-3" />
                                Перейти на Pro
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                          <Crown className="h-3 w-3 text-primary" />
                          <span>Pro · без ограничений</span>
                          <span className="ml-auto font-mono">{widget.monthly_views} встр.</span>
                        </div>
                      )}

                      <Link
                        to={`/embed-builder?widgetId=${widget.id}`}
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Открыть в конструкторе
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
