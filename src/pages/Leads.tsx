import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  Mail, Trash2, Download, Search, Users, Calendar, Calculator,
  ChevronDown, ChevronUp, Phone, User, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CalcLead {
  id: string;
  calculator_id: string;
  calculator_title: string | null;
  email: string;
  name: string | null;
  phone: string | null;
  form_values: Record<string, unknown>;
  result_values: Record<string, unknown>;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function Leads() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<CalcLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    const { data, error } = await (supabase.from("calc_leads" as any)
      .select("*")
      .eq("owner_user_id", user!.id)
      .order("created_at", { ascending: false }));
    if (!error && data) setLeads(data as CalcLead[]);
    setLoading(false);
  };

  const deleteLead = async (id: string) => {
    const { error } = await (supabase.from("calc_leads" as any).delete().eq("id", id));
    if (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить лид.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
    } else {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Удалено", variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Email", "Имя", "Телефон", "Калькулятор", "Дата"],
      ...filtered.map((l) => [l.email, l.name ?? "", l.phone ?? "", l.calculator_title ?? l.calculator_id, l.created_at]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = leads.filter(
    (l) =>
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.calculator_title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Group by calculator
  const grouped = filtered.reduce<Record<string, CalcLead[]>>((acc, l) => {
    const key = l.calculator_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(l);
    return acc;
  }, {});

  if (authLoading || !user) return null;

  return (
    <>
      <Helmet><title>Лиды — CalcHub</title></Helmet>
      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-10 border-b border-border">
          <div className="container max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Лиды</h1>
                <p className="text-sm text-muted-foreground">Контакты, собранные через ваши калькуляторы</p>
              </div>
            </div>
            {leads.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
                <Download className="h-4 w-4" /> Экспорт CSV
              </Button>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="py-6 border-b border-border bg-muted/30">
          <div className="container max-w-4xl grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{leads.length}</div>
              <div className="text-xs text-muted-foreground">Всего лидов</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Object.keys(grouped).length}</div>
              <div className="text-xs text-muted-foreground">Калькуляторов</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {leads.length > 0
                  ? formatDate(leads[0].created_at).split(",")[0]
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground">Последний лид</div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-10">
          <div className="container max-w-4xl space-y-6">
            {/* Search */}
            {leads.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Поиск по email, имени или калькулятору..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {loading ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Загрузка...</div>
            ) : leads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="font-medium">Нет лидов</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Добавьте поле «Email / Лид» в калькулятор, чтобы собирать контакты посетителей
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/calc-builder")} className="gap-1.5">
                    <Calculator className="h-4 w-4" /> Открыть конструктор
                  </Button>
                </CardContent>
              </Card>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Ничего не найдено</p>
            ) : (
              <div className="space-y-8">
                {Object.entries(grouped).map(([calcId, calcLeads]) => {
                  const calcTitle = calcLeads[0].calculator_title ?? calcId;
                  return (
                    <div key={calcId} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{calcTitle}</span>
                        <Badge variant="secondary" className="text-xs">{calcLeads.length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {calcLeads.map((lead) => {
                          const isExpanded = expandedId === lead.id;
                          const hasResults = Object.keys(lead.result_values ?? {}).length > 0;
                          return (
                            <Card key={lead.id} className="overflow-hidden">
                              <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 min-w-0">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-medium text-sm">{lead.name || <span className="text-muted-foreground italic">Без имени</span>}</p>
                                        {hasResults && (
                                          <Badge variant="outline" className="text-[10px]">есть результат</Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{lead.email}</span>
                                      </div>
                                      {lead.phone && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                          <Phone className="h-3 w-3 shrink-0" />
                                          <span>{lead.phone}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Calendar className="h-3 w-3 shrink-0" />
                                        <span>{formatDate(lead.created_at)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {(Object.keys(lead.form_values ?? {}).length > 0 || hasResults) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-muted-foreground"
                                        onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                                      >
                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                      onClick={() => deleteLead(lead.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>

                              {isExpanded && (
                                <CardContent className="px-4 pb-4 pt-2 space-y-3">
                                  {Object.keys(lead.form_values ?? {}).length > 0 && (
                                    <div>
                                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Значения формы</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {Object.entries(lead.form_values).map(([k, v]) => (
                                          <span key={k} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                            <span className="text-muted-foreground">{k}:</span> {String(v)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {hasResults && (
                                    <div>
                                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Результаты калькулятора</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {Object.entries(lead.result_values).map(([k, v]) => (
                                          <span key={k} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                            {k}: {String(v)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
