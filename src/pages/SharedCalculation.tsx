import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calculator, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface SharedCalc {
  title: string;
  calculator_type: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  created_at: string;
}

export default function SharedCalculation() {
  const { token } = useParams<{ token: string }>();
  const [calc, setCalc] = useState<SharedCalc | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase
      .from("saved_calculations")
      .select("title, calculator_type, parameters, result, created_at")
      .eq("share_token", token)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setCalc(data as SharedCalc);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (notFound || !calc) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Calculator className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="font-medium">Расчёт не найден</p>
            <p className="text-sm text-muted-foreground">Ссылка недействительна или расчёт был удалён</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/">На главную</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{calc.title} — CalcHub</title>
      </Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background py-10">
        <div className="container max-w-2xl space-y-6">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> На главную</Link>
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{calc.title}</CardTitle>
                <Badge variant="secondary">
                  {typeLabels[calc.calculator_type] || calc.calculator_type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(calc.created_at).toLocaleDateString("ru", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Параметры</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(calc.parameters).map(([key, val]) => (
                    <div key={key} className="bg-muted rounded-md px-3 py-2">
                      <p className="text-xs text-muted-foreground">{paramLabels[key] || key}</p>
                      <p className="text-sm font-medium">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Результаты</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(calc.result).map(([key, val]) => (
                    <div key={key} className="bg-muted rounded-md px-3 py-2">
                      <p className="text-xs text-muted-foreground">{paramLabels[key] || key}</p>
                      <p className="text-sm font-semibold">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
