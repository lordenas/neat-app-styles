import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { exportCalculationPdf } from "@/lib/export-pdf";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import {
  Plus, Trash2, Info, Calculator, ChevronDown, ChevronRight,
  TrendingDown, CalendarIcon, Printer, FileDown, Save,
  CheckCircle2, XCircle, TrendingUp, CalendarOff,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  calculateEarlyRepayment,
  type EarlyPaymentEntry,
  type RepaymentMode,
  type RecurringFrequency,
  type RateChangeEntry,
  type CreditHolidayEntry,
} from "@/lib/calculators/early-repayment";

/* ───────────── helpers ───────────── */

function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

function fmtMoney(n: number) {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function termLabel(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} мес.`;
  if (m === 0) return `${y} лет`;
  return `${y} л. ${m} мес.`;
}

/* ───────────── DatePick ───────────── */

function applyDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let result = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) result += ".";
    result += digits[i];
  }
  return result;
}

function parseMaskedDate(masked: string): Date | undefined {
  if (masked.length !== 10) return undefined;
  const [dd, mm, yyyy] = masked.split(".");
  const d = parseInt(dd, 10), m = parseInt(mm, 10), y = parseInt(yyyy, 10);
  if (!d || !m || !y || m < 1 || m > 12 || d < 1 || d > 31) return undefined;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) return date;
  return undefined;
}

function parseMaskedDateExt(s: string): Date | undefined {
  if (!s || s.length !== 10) return undefined;
  const [dd, mm, yyyy] = s.split(".");
  const d = parseInt(dd, 10), m = parseInt(mm, 10), y = parseInt(yyyy, 10);
  if (!d || !m || !y) return undefined;
  return new Date(y, m - 1, d);
}

function DatePick({
  value, onChange, placeholder = "дд.мм.гггг", small = false,
}: {
  value?: Date; onChange?: (d: Date | undefined) => void; placeholder?: string; small?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? format(value, "dd.MM.yyyy") : "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setInputValue(value ? format(value, "dd.MM.yyyy") : "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyDateMask(e.target.value);
    setInputValue(masked);
    const parsed = parseMaskedDate(masked);
    if (parsed) onChange?.(parsed);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn(
        "flex items-center rounded-md border border-input ring-offset-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        small ? "w-36" : "w-48"
      )}>
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          aria-label="Выберите дату"
          className={cn(
            "flex-1 min-w-0 rounded-l-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none",
            small ? "h-8 px-2 text-xs" : "h-10 px-3 text-sm",
          )}
        />
        <PopoverTrigger asChild>
          <button type="button"
            className={cn(
              "shrink-0 flex items-center justify-center rounded-r-md bg-background text-muted-foreground hover:text-foreground transition-colors focus:outline-none",
              small ? "h-8 w-8" : "h-10 w-10"
            )}
            aria-label="Открыть календарь"
          >
            <CalendarIcon className={small ? "h-3 w-3" : "h-4 w-4"} />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={(d) => { onChange?.(d); setOpen(false); }}
          locale={ru} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );
}

/* ───────────── FormRow ───────────── */

function FormRow({ label, tooltip, children, className }: {
  label: string; tooltip?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 ${className ?? ""}`}>
      <div className="sm:w-48 shrink-0 flex items-center gap-1 sm:justify-end sm:pt-2">
        <Label className="text-sm text-muted-foreground text-right">{label}</Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="inline-flex">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* ───────────── SectionToggle ───────────── */

function SectionToggle({ title, icon, count, children, defaultOpen = false }: {
  title: string; icon: React.ReactNode; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button type="button" className="flex items-center gap-2 w-full text-left group py-1">
          {open
            ? <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />}
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{title}</span>
          {(count ?? 0) > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{count}</span>
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pt-3 space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

/* ───────────── Main page ───────────── */

let nextId = 1;

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export default function CreditEarlyRepaymentCalculatorPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- Form state ---
  const [loanAmountStr, setLoanAmountStr] = useState("5 000 000");
  const [annualRate, setAnnualRate] = useState("18");
  const [termValue, setTermValue] = useState("15");
  const [termUnit, setTermUnit] = useState<"years" | "months">("years");
  const [issueDate, setIssueDate] = useState<Date>(new Date(2026, 1, 22));
  const [earlyPayments, setEarlyPayments] = useState<EarlyPaymentEntry[]>([]);

  // --- 5 new features ---
  const [rateChanges, setRateChanges] = useState<RateChangeEntry[]>([]);
  const [creditHolidays, setCreditHolidays] = useState<CreditHolidayEntry[]>([]);
  const [firstPayInterest, setFirstPayInterest] = useState(false);
  const [roundPay, setRoundPay] = useState(false);
  const [roundTo, setRoundTo] = useState<"rub" | "hundred">("rub");
  const [transferWeekend, setTransferWeekend] = useState(false);
  const [transferDir, setTransferDir] = useState<"next" | "prev">("next");

  // --- Save dialog ---
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // --- Parsed inputs ---
  const loanAmount = useMemo(() => {
    return Math.max(0, parseInt(loanAmountStr.replace(/\D/g, ""), 10) || 0);
  }, [loanAmountStr]);

  const termMonths = useMemo(() => {
    const v = parseInt(termValue, 10) || 0;
    return termUnit === "years" ? v * 12 : v;
  }, [termValue, termUnit]);

  const rate = useMemo(() => Math.max(0, parseFloat(annualRate) || 0), [annualRate]);

  // --- Calculation ---
  const result = useMemo(() => {
    if (loanAmount <= 0 || termMonths <= 0 || rate <= 0) return null;
    return calculateEarlyRepayment(
      loanAmount, rate, termMonths, issueDate,
      earlyPayments, rateChanges, creditHolidays,
      firstPayInterest, roundPay, roundTo,
      transferWeekend, transferDir,
    );
  }, [
    loanAmount, rate, termMonths, issueDate,
    earlyPayments, rateChanges, creditHolidays,
    firstPayInterest, roundPay, roundTo,
    transferWeekend, transferDir,
  ]);

  /* ── early payments CRUD ── */
  const addEarlyPayment = () => {
    setEarlyPayments((p) => [...p, {
      id: nextId++,
      date: format(addMonths(issueDate, 6), "dd.MM.yyyy"),
      amount: 300_000,
      mode: "reduce_term",
      recurring: false,
    }]);
  };
  const removeEarlyPayment = (id: number) => setEarlyPayments((p) => p.filter((r) => r.id !== id));
  const updateEarlyPayment = (id: number, patch: Partial<EarlyPaymentEntry>) =>
    setEarlyPayments((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  /* ── rate changes CRUD ── */
  const addRateChange = () => {
    setRateChanges((p) => [...p, {
      id: nextId++,
      date: format(addMonths(issueDate, 12), "dd.MM.yyyy"),
      ratePercent: rate,
      recalcMode: "payment",
    }]);
  };
  const removeRateChange = (id: number) => setRateChanges((p) => p.filter((r) => r.id !== id));
  const updateRateChange = (id: number, patch: Partial<RateChangeEntry>) =>
    setRateChanges((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  /* ── credit holidays CRUD ── */
  const addCreditHoliday = () => {
    setCreditHolidays((p) => [...p, {
      id: nextId++,
      startDate: format(addMonths(issueDate, 3), "dd.MM.yyyy"),
      months: 3,
      type: "interest",
    }]);
  };
  const removeCreditHoliday = (id: number) => setCreditHolidays((p) => p.filter((r) => r.id !== id));
  const updateCreditHoliday = (id: number, patch: Partial<CreditHolidayEntry>) =>
    setCreditHolidays((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  /* ── Actions ── */
  const handleSave = async () => {
    if (!user) {
      toast({ title: "Войдите в аккаунт", description: "Для сохранения расчётов нужна авторизация.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
      navigate("/auth");
      return;
    }
    setSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    if (!user || !saveTitle.trim() || !result) return;
    setSaving(true);
    const { error } = await supabase.from("saved_calculations").insert({
      user_id: user.id,
      title: saveTitle.trim(),
      calculator_type: "credit-early-repayment",
      parameters: { loanAmount, annualRate: rate, termMonths, issueDate: issueDate.toISOString() },
      result: {
        baseMonthlyPayment: result.baseMonthlyPayment,
        baseTotalInterest: result.baseTotalInterest,
        totalInterest: result.totalInterest,
        interestSaved: result.interestSaved,
        termSavedMonths: result.termSavedMonths,
      },
    });
    setSaving(false);
    setSaveDialogOpen(false);
    setSaveTitle("");
    if (error) {
      toast({ title: "Ошибка", description: "Не удалось сохранить расчёт.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
    } else {
      toast({ title: "Сохранено", description: "Расчёт добавлен в личный кабинет.", variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
    }
  };

  const handleExportPdf = () => {
    if (!result) return;
    exportCalculationPdf({
      title: "Калькулятор досрочного погашения — Результаты",
      summary: [
        { label: "Платёж без досрочных", value: fmtMoney(result.baseMonthlyPayment) + " ₽" },
        { label: "Переплата без досрочных", value: fmtMoney(result.baseTotalInterest) + " ₽" },
        { label: "Переплата с досрочными", value: fmtMoney(result.totalInterest) + " ₽" },
        { label: "Сэкономлено на %", value: fmtMoney(result.interestSaved) + " ₽" },
        { label: "Сокращение срока", value: termLabel(result.termSavedMonths) },
        { label: "Всего досрочно", value: fmtMoney(result.totalEarlyPaid) + " ₽" },
      ],
      debtBreakdown: { principal: loanAmount, interest: result.totalInterest },
      schedule: result.schedule,
      totals: {
        payment: result.schedule.reduce((s, r) => s + r.payment, 0),
        principal: loanAmount,
        interest: result.totalInterest,
        early: result.totalEarlyPaid,
      },
    });
  };

  /* ── Chart data ── */
  const barData = result ? result.schedule.slice(0, 60).map((row) => ({
    date: row.date.slice(3),
    principal: row.principal,
    interest: row.interest,
    early: row.early,
  })) : [];

  const totalPayment = result ? result.schedule.reduce((s, r) => s + r.payment, 0) : 0;
  const totalPrincipal = loanAmount;
  const totalInterest = result?.totalInterest ?? 0;
  const totalEarly = result?.totalEarlyPaid ?? 0;

  /* ── Row type badge helper ── */
  const rowTypeBadge = (type?: string) => {
    if (type === "holiday_none") return <span className="ml-1 text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded px-1">каникулы</span>;
    if (type === "holiday_interest") return <span className="ml-1 text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded px-1">%</span>;
    return null;
  };

  return (
    <CalculatorLayout calculatorId="credit-early-repayment" categoryName="Финансы" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("calculatorNames.credit-early-repayment")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("calculatorDescriptions.credit-early-repayment")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Form */}
            <div className="section-card space-y-5">
              <div className="space-y-4">

                <FormRow label="Сумма кредита">
                  <Input
                    formatNumber
                    value={loanAmountStr}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setLoanAmountStr(digits ? parseInt(digits).toLocaleString("ru-RU") : "");
                    }}
                    placeholder="5 000 000"
                    className="max-w-52"
                    inputEnd={<span className="text-sm font-medium">₽</span>}
                  />
                </FormRow>

                <FormRow label="Срок">
                  <div className="flex gap-2">
                    <Input
                      type="number" min={1} value={termValue}
                      onChange={(e) => setTermValue(e.target.value)}
                      placeholder="15" className="max-w-20"
                    />
                    <Select value={termUnit} onValueChange={(v) => setTermUnit(v as "years" | "months")}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="years">лет</SelectItem>
                        <SelectItem value="months">месяцев</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormRow>

                <FormRow label="Дата выдачи">
                  <DatePick value={issueDate} onChange={(d) => d && setIssueDate(d)} />
                </FormRow>

                <FormRow label="Ставка" tooltip="Годовая процентная ставка по кредиту">
                  <div className="space-y-2">
                    <Input
                      type="number" step={0.1} min={0}
                      value={annualRate}
                      onChange={(e) => setAnnualRate(e.target.value)}
                      placeholder="18"
                      className="max-w-28"
                      inputEnd={<span className="text-sm font-medium">%</span>}
                    />
                    {/* Rate changes inline table */}
                    {rateChanges.length > 0 && (
                      <div className="rounded-md border border-border overflow-hidden mt-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/50 border-b border-border">
                              <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Дата изменения</th>
                              <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Ставка, %</th>
                              <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Пересчитать</th>
                              <th className="w-8" />
                            </tr>
                          </thead>
                          <tbody>
                            {rateChanges.map((rc) => (
                              <tr key={rc.id} className="border-b border-border last:border-0">
                                <td className="px-2 py-1">
                                  <DatePick
                                    small
                                    value={parseMaskedDateExt(rc.date)}
                                    onChange={(d) => updateRateChange(rc.id, { date: d ? format(d, "dd.MM.yyyy") : "" })}
                                  />
                                </td>
                                <td className="px-2 py-1">
                                  <Input
                                    type="number" step={0.1} min={0}
                                    inputSize="sm"
                                    className="w-20"
                                    value={rc.ratePercent}
                                    onChange={(e) => updateRateChange(rc.id, { ratePercent: parseFloat(e.target.value) || 0 })}
                                    inputEnd={<span className="text-xs">%</span>}
                                  />
                                </td>
                                <td className="px-2 py-1">
                                  <Select
                                    value={rc.recalcMode}
                                    onValueChange={(v) => updateRateChange(rc.id, { recalcMode: v as "payment" | "term" })}
                                  >
                                    <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="payment">Платёж</SelectItem>
                                      <SelectItem value="term">Срок</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-2 py-1">
                                  <Button variant="ghost" size="icon-sm" onClick={() => removeRateChange(rc.id)} aria-label="Удалить">
                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={addRateChange}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                    >
                      <Plus className="h-3 w-3" /> Изменение ставки
                    </button>
                  </div>
                </FormRow>
              </div>

              <Separator />

              {/* ── Options ── */}
              <div className="space-y-3">
                {/* First payment interest-only */}
                <div className="flex items-center gap-2 sm:pl-52">
                  <Checkbox
                    id="first-pay-interest"
                    checked={firstPayInterest}
                    onCheckedChange={(v) => setFirstPayInterest(!!v)}
                  />
                  <Label htmlFor="first-pay-interest" className="text-sm cursor-pointer">
                    Первый платёж – только проценты
                  </Label>
                </div>

                {/* Round payment */}
                <div className="flex items-center gap-2 sm:pl-52 flex-wrap">
                  <Checkbox
                    id="round-pay"
                    checked={roundPay}
                    onCheckedChange={(v) => setRoundPay(!!v)}
                  />
                  <Label htmlFor="round-pay" className="text-sm cursor-pointer">
                    Округлять платёж
                  </Label>
                  {roundPay && (
                    <Select value={roundTo} onValueChange={(v) => setRoundTo(v as "rub" | "hundred")}>
                      <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rub">До рублей</SelectItem>
                        <SelectItem value="hundred">До сотен рублей</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Transfer weekends */}
                <div className="flex items-center gap-2 sm:pl-52 flex-wrap">
                  <Checkbox
                    id="transfer-weekend"
                    checked={transferWeekend}
                    onCheckedChange={(v) => setTransferWeekend(!!v)}
                  />
                  <Label htmlFor="transfer-weekend" className="text-sm cursor-pointer">
                    Переносить с выходных
                  </Label>
                  {transferWeekend && (
                    <Select value={transferDir} onValueChange={(v) => setTransferDir(v as "next" | "prev")}>
                      <SelectTrigger className="h-8 text-xs w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="next">На следующий рабочий</SelectItem>
                        <SelectItem value="prev">На предыдущий рабочий</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <Separator />

              {/* ── Collapsible sections ── */}
              <div className="space-y-3">
                {/* Early payments */}
                <SectionToggle
                  title="Досрочные погашения"
                  icon={<TrendingDown className="h-4 w-4" />}
                  count={earlyPayments.length}
                  defaultOpen={earlyPayments.length > 0}
                >
                  {earlyPayments.map((ep) => (
                    <div key={ep.id} className="flex flex-col gap-1.5 pb-2 border-b border-border last:border-0">
                      {/* Row 1: тип, дата, сумма, режим, удалить */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select
                          value={ep.recurring ? "recurring" : "once"}
                          onValueChange={(v) => updateEarlyPayment(ep.id, {
                            recurring: v === "recurring",
                            ...(v === "recurring" && !ep.frequency ? { frequency: "monthly" as RecurringFrequency } : {}),
                            ...(v === "recurring" && !ep.endDate ? { endDate: format(addMonths(issueDate, 12), "dd.MM.yyyy") } : {}),
                          })}
                        >
                          <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Разовый</SelectItem>
                            <SelectItem value="recurring">Регулярный</SelectItem>
                          </SelectContent>
                        </Select>
                        <DatePick
                          small
                          value={parseMaskedDateExt(ep.date)}
                          onChange={(d) => updateEarlyPayment(ep.id, { date: d ? format(d, "dd.MM.yyyy") : "" })}
                        />
                        <Input
                          type="text" inputSize="sm" placeholder="Сумма" className="w-28"
                          value={ep.amount ? ep.amount.toLocaleString("ru-RU") : ""}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            updateEarlyPayment(ep.id, { amount: digits ? parseInt(digits) : 0 });
                          }}
                        />
                        <Select
                          value={ep.mode}
                          onValueChange={(v) => updateEarlyPayment(ep.id, { mode: v as RepaymentMode })}
                        >
                          <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reduce_term">Уменьшить срок</SelectItem>
                            <SelectItem value="reduce_payment">Уменьшить платёж</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon-sm" onClick={() => removeEarlyPayment(ep.id)} aria-label="Удалить">
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                      {/* Row 2: поля регулярного платежа */}
                      {ep.recurring && (
                        <div className="flex items-center gap-2 flex-wrap pl-1">
                          <span className="text-xs text-muted-foreground">по</span>
                          <Select
                            value={ep.frequency ?? "monthly"}
                            onValueChange={(v) => updateEarlyPayment(ep.id, { frequency: v as RecurringFrequency })}
                          >
                            <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">каждый месяц</SelectItem>
                              <SelectItem value="quarterly">каждый квартал</SelectItem>
                              <SelectItem value="yearly">каждый год</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-xs text-muted-foreground">до</span>
                          <DatePick
                            small
                            value={parseMaskedDateExt(ep.endDate ?? "")}
                            onChange={(d) => updateEarlyPayment(ep.id, { endDate: d ? format(d, "dd.MM.yyyy") : "" })}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addEarlyPayment}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Добавить
                  </button>
                </SectionToggle>

                {/* Credit holidays */}
                <SectionToggle
                  title="Кредитные каникулы"
                  icon={<CalendarOff className="h-4 w-4" />}
                  count={creditHolidays.length}
                  defaultOpen={creditHolidays.length > 0}
                >
                  <p className="text-xs text-muted-foreground -mt-1">
                    Период, в котором платёж отсутствует или выплачиваются только проценты. После каникул платёж пересчитывается.
                  </p>
                  {creditHolidays.map((h) => (
                    <div key={h.id} className="flex items-center gap-2 flex-wrap">
                      <DatePick
                        small
                        value={parseMaskedDateExt(h.startDate)}
                        onChange={(d) => updateCreditHoliday(h.id, { startDate: d ? format(d, "dd.MM.yyyy") : "" })}
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          type="number" inputSize="sm" min={1} max={24}
                          placeholder="3" className="w-16"
                          value={h.months}
                          onChange={(e) => updateCreditHoliday(h.id, { months: parseInt(e.target.value) || 1 })}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">мес.</span>
                      </div>
                      <Select
                        value={h.type}
                        onValueChange={(v) => updateCreditHoliday(h.id, { type: v as "none" | "interest" })}
                      >
                        <SelectTrigger className="h-8 text-xs w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interest">Только проценты</SelectItem>
                          <SelectItem value="none">Без платежей</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon-sm" onClick={() => removeCreditHoliday(h.id)} aria-label="Удалить">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <button type="button" onClick={addCreditHoliday}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Добавить
                  </button>
                </SectionToggle>
              </div>

              <Separator />

              <div className="flex items-center gap-3 sm:pl-52">
                <Button icon={<Calculator className="h-4 w-4" />}>
                  Рассчитать
                </Button>
              </div>
            </div>

            {/* Results */}
            {result && (
              <section className="section-card space-y-5" aria-labelledby="results-heading">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 id="results-heading" className="text-lg font-semibold">Результаты расчёта</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" icon={<Printer />} onClick={() => window.print()}>Печать</Button>
                    <Button variant="outline" size="sm" icon={<FileDown />} onClick={handleExportPdf}>PDF</Button>
                    <Button variant="outline" size="sm" icon={<Save />} onClick={handleSave}>Сохранить</Button>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Платёж без досрочных",
                      value: fmtMoney(result.baseMonthlyPayment) + " ₽",
                      sub: earlyPayments.length ? `→ изменится после погашений` : undefined,
                    },
                    {
                      label: "Переплата без досрочных",
                      value: fmtMoney(result.baseTotalInterest) + " ₽",
                      color: "text-destructive",
                    },
                    {
                      label: "Переплата с досрочными",
                      value: fmtMoney(result.totalInterest) + " ₽",
                      color: "text-destructive",
                    },
                    {
                      label: "Экономия на процентах",
                      value: fmtMoney(result.interestSaved) + " ₽",
                      color: result.interestSaved > 0 ? "text-[hsl(var(--success))]" : "text-foreground",
                    },
                    {
                      label: "Сокращение срока",
                      value: result.termSavedMonths > 0 ? termLabel(result.termSavedMonths) : "—",
                      color: result.termSavedMonths > 0 ? "text-[hsl(var(--success))]" : undefined,
                    },
                    {
                      label: "Всего досрочно внесено",
                      value: fmtMoney(result.totalEarlyPaid) + " ₽",
                    },
                    {
                      label: "Фактический срок",
                      value: termLabel(result.actualTermMonths),
                      sub: result.termSavedMonths > 0 ? `из ${termLabel(result.baseTermMonths)}` : undefined,
                      color: result.termSavedMonths > 0 ? "text-[hsl(var(--success))]" : "text-foreground",
                    },
                    {
                      label: "Переплата в %",
                      value: loanAmount > 0
                        ? ((result.totalInterest / loanAmount) * 100).toFixed(1) + "%"
                        : "—",
                      sub: loanAmount > 0
                        ? `без доср.: ${((result.baseTotalInterest / loanAmount) * 100).toFixed(1)}%`
                        : undefined,
                      color: "text-destructive",
                    },
                    {
                      label: "Всего выплат",
                      value: fmtMoney(loanAmount + result.totalInterest) + " ₽",
                      sub: `долг ${fmtMoney(loanAmount)} + % ${fmtMoney(result.totalInterest)}`,
                    },
                  ].map((item) => (
                    <div key={item.label} className="form-section space-y-1">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className={`text-lg font-semibold font-mono ${item.color ?? "text-foreground"}`}>
                        {item.value}
                      </p>
                      {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                    </div>
                  ))}
                </div>

                {/* Savings highlight */}
                {result.interestSaved > 0 && (
                  <div className="rounded-lg bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20 px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))] shrink-0" />
                    <p className="text-sm">
                      <span className="font-semibold text-[hsl(var(--success))]">
                        Вы экономите {fmtMoney(result.interestSaved)} ₽
                      </span>
                      {result.termSavedMonths > 0 && (
                        <span className="text-muted-foreground"> и сокращаете срок на {termLabel(result.termSavedMonths)}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Active features badges */}
                {(firstPayInterest || roundPay || transferWeekend || rateChanges.length > 0 || creditHolidays.length > 0) && (
                  <div className="flex flex-wrap gap-1.5">
                    {firstPayInterest && (
                      <span className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1">1-й платёж: только %</span>
                    )}
                    {roundPay && (
                      <span className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1">
                        Округление: {roundTo === "rub" ? "до рублей" : "до сотен"}
                      </span>
                    )}
                    {transferWeekend && (
                      <span className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1">
                        Перенос: {transferDir === "next" ? "следующий рабочий" : "предыдущий рабочий"}
                      </span>
                    )}
                    {rateChanges.length > 0 && (
                      <span className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1">
                        Изменений ставки: {rateChanges.length}
                      </span>
                    )}
                    {creditHolidays.length > 0 && (
                      <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-2.5 py-1">
                        Каникулы: {creditHolidays.reduce((s, h) => s + h.months, 0)} мес.
                      </span>
                    )}
                  </div>
                )}

                {/* Donut chart */}
                <div role="figure" aria-label="Структура выплат">
                  <h3 className="text-sm font-medium mb-3">Структура выплат</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Основной долг", value: loanAmount },
                              { name: "Проценты (итого)", value: result.totalInterest },
                              ...(result.interestSaved > 0 ? [{ name: "Сэкономлено", value: result.interestSaved }] : []),
                            ]}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={80}
                            paddingAngle={2} dataKey="value" strokeWidth={0}
                          >
                            <Cell fill="hsl(var(--success))" />
                            <Cell fill="hsl(var(--destructive))" />
                            <Cell fill="hsl(var(--primary))" />
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: number) => fmt(value) + " ₽"}
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "var(--radius)",
                              color: "hsl(var(--popover-foreground))",
                              fontSize: "0.75rem",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[hsl(var(--success))]" />
                        <span className="text-sm text-muted-foreground">Основной долг</span>
                        <span className="text-sm font-semibold font-mono">{fmt(loanAmount)} ₽</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-destructive" />
                        <span className="text-sm text-muted-foreground">Проценты</span>
                        <span className="text-sm font-semibold font-mono">{fmt(result.totalInterest)} ₽</span>
                      </div>
                      {result.interestSaved > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-primary" />
                          <span className="text-sm text-muted-foreground">Сэкономлено</span>
                          <span className="text-sm font-semibold font-mono text-primary">{fmt(result.interestSaved)} ₽</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bar chart */}
                <div role="figure" aria-label="Разбивка платежей по месяцам">
                  <h3 className="text-sm font-medium mb-3">Разбивка платежей по месяцам</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date"
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          tickLine={false}
                          axisLine={{ stroke: "hsl(var(--border))" }}
                          interval={Math.floor(barData.length / 8)}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          tickLine={false}
                          axisLine={{ stroke: "hsl(var(--border))" }}
                          tickFormatter={(v) => (v / 1000).toFixed(0) + "k"}
                        />
                        <RechartsTooltip
                          formatter={(value: number, name: string) => [
                            fmt(value) + " ₽",
                            name === "principal" ? "Основной долг" : name === "interest" ? "Проценты" : "Досрочное",
                          ]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                            color: "hsl(var(--popover-foreground))",
                            fontSize: "0.75rem",
                          }}
                        />
                        <Legend
                          formatter={(value) =>
                            value === "principal" ? "Основной долг" : value === "interest" ? "Проценты" : "Досрочное"
                          }
                          wrapperStyle={{ fontSize: "0.75rem" }}
                        />
                        <Bar dataKey="principal" stackId="a" fill="hsl(var(--success))" />
                        <Bar dataKey="interest" stackId="a" fill="hsl(var(--destructive))" />
                        {result.totalEarlyPaid > 0 && (
                          <Bar dataKey="early" stackId="a" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <Separator />

                {/* Schedule table */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <h3 className="text-sm font-medium">График погашения</h3>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" icon={<FileDown />} onClick={handleExportPdf}>PDF</Button>
                      <Button variant="outline" size="sm" icon={<Printer />} onClick={() => window.print()}>Печать</Button>
                    </div>
                  </div>
                  <div className="rounded-md border relative overflow-auto max-h-[480px]">
                    <Table size="sm" striped hoverable>
                      <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                        <TableRow className="border-b-0">
                          <TableHead className="w-10">#</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead className="text-right">Платёж</TableHead>
                          <TableHead className="text-right">Осн. долг</TableHead>
                          <TableHead className="text-right">Проценты</TableHead>
                          <TableHead className="text-right">Ставка</TableHead>
                          <TableHead className="text-right">Досрочное</TableHead>
                          <TableHead className="text-right">Остаток</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.schedule.map((row) => (
                          <TableRow
                            key={row.n}
                            className={cn(
                              row.rowType === "holiday_none" && "bg-amber-500/5",
                              row.rowType === "holiday_interest" && "bg-blue-500/5",
                            )}
                          >
                            <TableCell className="font-mono text-muted-foreground text-xs">{row.n}</TableCell>
                            <TableCell className="text-xs">
                              {row.date}
                              {rowTypeBadge(row.rowType)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">{fmt(row.payment)}</TableCell>
                            <TableCell className="text-right font-mono text-xs text-[hsl(var(--success))]">
                              {row.principal > 0 ? fmt(row.principal) : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-destructive">
                              {fmt(row.interest)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                              {row.ratePercent}%
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {row.early > 0
                                ? <span className="text-primary font-medium">{fmt(row.early)}</span>
                                : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">{fmt(row.balance)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                        <TableFooter className="sticky bottom-0 z-10 bg-card shadow-[0_-1px_0_0_hsl(var(--border))]">
                        <TableRow className="border-t-0 font-semibold">
                          <TableCell colSpan={2} className="text-xs">Итого</TableCell>
                          <TableCell className="text-right font-mono text-xs">{fmt(totalPayment)}</TableCell>
                          <TableCell className="text-right font-mono text-xs text-[hsl(var(--success))]">{fmt(totalPrincipal)}</TableCell>
                          <TableCell className="text-right font-mono text-xs text-destructive">{fmt(totalInterest)}</TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground">—</TableCell>
                          <TableCell className="text-right font-mono text-xs text-primary">{fmt(totalEarly)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">—</TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Save dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранить расчёт</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="save-title-er">Название расчёта</Label>
            <Input
              id="save-title-er"
              placeholder="Например: Ипотека с досрочным 500к"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmSave()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Отмена</Button>
            <Button onClick={confirmSave} disabled={!saveTitle.trim() || saving}>
              {saving ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CalculatorLayout>
  );
}
