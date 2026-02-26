import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, BarChart3, Printer, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { getCyrillicFont } from "@/lib/cyrillic-font";
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

const DEMO_DATA: CalcData[] = [
  {
    id: "demo-1",
    title: "Ипотека Сбербанк 4%",
    calculator_type: "credit",
    parameters: { amount: "10 500 000 ₽", rate: "4%", term: "25 лет", type: "Аннуитетный" },
    result: { monthlyPayment: "50 109 ₽", overpayment: "7 783 442 ₽", totalPayment: "18 283 442 ₽" },
  },
  {
    id: "demo-2",
    title: "Ипотека ВТБ 5.5%",
    calculator_type: "credit",
    parameters: { amount: "10 500 000 ₽", rate: "5.5%", term: "25 лет", type: "Аннуитетный" },
    result: { monthlyPayment: "64 230 ₽", overpayment: "8 769 000 ₽", totalPayment: "19 269 000 ₽" },
  },
  {
    id: "demo-3",
    title: "Ипотека Альфа 6%",
    calculator_type: "credit",
    parameters: { amount: "10 500 000 ₽", rate: "6%", term: "20 лет", type: "Аннуитетный" },
    result: { monthlyPayment: "75 220 ₽", overpayment: "7 552 800 ₽", totalPayment: "18 052 800 ₽" },
  },
];

export default function Compare() {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  const [calculations, setCalculations] = useState<CalcData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ids.length === 0) {
      // No IDs — show demo data
      setCalculations(DEMO_DATA);
      setLoading(false);
      return;
    }
    supabase
      .from("saved_calculations")
      .select("id, title, calculator_type, parameters, result")
      .in("id", ids)
      .then(({ data }) => {
        const result = (data as CalcData[]) || [];
        setCalculations(result.length > 0 ? result : DEMO_DATA);
        setLoading(false);
      });
  }, [searchParams]);

  const allParamKeys = [...new Set(calculations.flatMap((c) => Object.keys(c.parameters)))];
  const allResultKeys = [...new Set(calculations.flatMap((c) => Object.keys(c.result)))];

  const handlePrint = () => window.print();

  const handlePdf = async () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const fontBase64 = await getCyrillicFont();
      doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      doc.setFont("Roboto", "normal");

      const margin = 14;
      const pageW = doc.internal.pageSize.getWidth();
      const contentW = pageW - margin * 2;
      let y = margin;

      doc.setFontSize(14);
      doc.setTextColor(30, 30, 50);
      doc.text("Сравнение расчётов", margin, y + 5);
      y += 12;

      const colCount = calculations.length + 1;
      const colW = contentW / colCount;

      // Header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, contentW, 8, "F");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("Параметр", margin + 2, y + 5);
      calculations.forEach((c, i) => {
        doc.text(c.title, margin + colW * (i + 1) + 2, y + 5);
      });
      y += 10;

      const drawRow = (label: string, values: string[], bold = false) => {
        if (y > 190) { doc.addPage(); y = margin; }
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(label, margin + 2, y + 4);
        doc.setTextColor(30, 30, 50);
        if (bold) doc.setFont("Roboto", "normal");
        values.forEach((v, i) => {
          doc.text(v, margin + colW * (i + 1) + 2, y + 4);
        });
        y += 6;
      };

      // Section: Params
      doc.setFillColor(235, 235, 235);
      doc.rect(margin, y, contentW, 6, "F");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("ПАРАМЕТРЫ", margin + 2, y + 4);
      y += 8;

      allParamKeys.forEach((key) => {
        drawRow(paramLabels[key] || key, calculations.map((c) => String(c.parameters[key] ?? "—")));
      });

      // Section: Results
      doc.setFillColor(235, 235, 235);
      doc.rect(margin, y, contentW, 6, "F");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("РЕЗУЛЬТАТЫ", margin + 2, y + 4);
      y += 8;

      allResultKeys.forEach((key) => {
        drawRow(paramLabels[key] || key, calculations.map((c) => String(c.result[key] ?? "—")), true);
      });

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`CalcHub — ${new Date().toLocaleDateString("ru")}`, margin, doc.internal.pageSize.getHeight() - 8);

      doc.save(`CalcHub_Compare_${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Сравнение расчётов — CalcHub</title></Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background py-10">
        <div className="container max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Назад
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer className="h-4 w-4" /> Печать
              </Button>
              <Button variant="outline" size="sm" onClick={handlePdf} loading={pdfLoading} className="gap-1.5">
                <Download className="h-4 w-4" /> PDF
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Сравнение расчётов</h1>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-center py-10">Загрузка...</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {calculations.length} расчёт{calculations.length === 1 ? "" : calculations.length < 5 ? "а" : "ов"}
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
