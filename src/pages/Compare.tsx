import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const typeLabels: Record<string, string> = {
  credit: "Кредит",
  mortgage: "Ипотека",
  deposit: "Вклад",
  tax: "Налог",
  business: "Бизнес",
};

const paramLabels: Record<string, string> = {
  amount: "Сумма",
  rate: "Ставка",
  term: "Срок",
  type: "Тип платежа",
  monthlyPayment: "Ежемесячный платёж",
  overpayment: "Переплата",
  totalPayment: "Итого выплачено",
  interestTotal: "Проценты",
};

interface CalcData {
  id: string;
  title: string;
  calculator_type: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
}

export default function Compare() {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  const [calculations, setCalculations] = useState<CalcData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    supabase
      .from("saved_calculations")
      .select("id, title, calculator_type, parameters, result")
      .in("id", ids)
      .then(({ data }) => {
        setCalculations((data as CalcData[]) || []);
        setLoading(false);
      });
  }, [searchParams]);

  // Collect all unique keys from params and results
  const allParamKeys = [...new Set(calculations.flatMap((c) => Object.keys(c.parameters)))];
  const allResultKeys = [...new Set(calculations.flatMap((c) => Object.keys(c.result)))];

  return (
    <>
      <Helmet><title>Сравнение расчётов — CalcHub</title></Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background py-10">
        <div className="container max-w-4xl space-y-6">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Назад</Link>
          </Button>

          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Сравнение расчётов</h1>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-center py-10">Загрузка...</p>
          ) : calculations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Расчёты не найдены. Выберите расчёты в личном кабинете.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {calculations.length} расчёт{calculations.length > 1 ? "а" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Параметр</TableHead>
                      {calculations.map((c) => (
                        <TableHead key={c.id} className="min-w-[160px]">
                          <div className="space-y-1">
                            <span className="font-medium">{c.title}</span>
                            <Badge variant="secondary" className="text-xs block w-fit">
                              {typeLabels[c.calculator_type] || c.calculator_type}
                            </Badge>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allParamKeys.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={calculations.length + 1} className="bg-muted/50 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                          Параметры
                        </TableCell>
                      </TableRow>
                    )}
                    {allParamKeys.map((key) => (
                      <TableRow key={`p-${key}`}>
                        <TableCell className="text-sm text-muted-foreground">{paramLabels[key] || key}</TableCell>
                        {calculations.map((c) => (
                          <TableCell key={c.id} className="text-sm font-medium">
                            {String(c.parameters[key] ?? "—")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {allResultKeys.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={calculations.length + 1} className="bg-muted/50 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                          Результаты
                        </TableCell>
                      </TableRow>
                    )}
                    {allResultKeys.map((key) => (
                      <TableRow key={`r-${key}`}>
                        <TableCell className="text-sm text-muted-foreground">{paramLabels[key] || key}</TableCell>
                        {calculations.map((c) => (
                          <TableCell key={c.id} className="text-sm font-semibold">
                            {String(c.result[key] ?? "—")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
