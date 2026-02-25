import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { exportCalculationPdf } from "@/lib/export-pdf";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Plus,
  Trash2,
  Info,
  Calculator,
  Clock,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  CalendarOff,
  Wallet,
  Percent,
  CalendarIcon,
  Printer,
  FileDown,
  Save,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

/* ───────────────────── date picker ───────────────────── */

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
  const d = parseInt(dd, 10),
    m = parseInt(mm, 10),
    y = parseInt(yyyy, 10);
  if (!d || !m || !y || m < 1 || m > 12 || d < 1 || d > 31) return undefined;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) return date;
  return undefined;
}

function DatePick({
  value,
  onChange,
  placeholder = "дд.мм.гггг",
  small = false,
}: {
  value?: Date;
  onChange?: (d: Date | undefined) => void;
  placeholder?: string;
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? format(value, "dd.MM.yyyy") : "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // sync external value → input text
  React.useEffect(() => {
    setInputValue(value ? format(value, "dd.MM.yyyy") : "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyDateMask(e.target.value);
    setInputValue(masked);
    const parsed = parseMaskedDate(masked);
    if (parsed) {
      onChange?.(parsed);
    }
  };

  const handleCalendarSelect = (d: Date | undefined) => {
    onChange?.(d);
    setOpen(false);
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
          aria-label={small ? "Выберите дату" : "Дата в формате дд.мм.гггг"}
          className={cn(
            "flex-1 min-w-0 rounded-l-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none",
            small ? "h-8 px-2 text-xs" : "h-10 px-3 text-sm",
          )}
        />
        <PopoverTrigger asChild>
          <button
            type="button"
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
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleCalendarSelect}
          locale={ru}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

/* ───────────────────── types ───────────────────── */

interface RateRow {
  id: number;
  date: string;
  rate: string;
  recalc: string;
}
interface EarlyPayment {
  id: number;
  date: string;
  amount: string;
  period: string;
  recalc: string;
}
interface CommonPayment {
  id: number;
  date: string;
  amount: string;
  recalc: string;
}
interface Holiday {
  id: number;
  start: string;
  months: string;
  payment: string;
}

/* ──────────── form row ──────────── */

function FormRow({
  label,
  tooltip,
  children,
  className,
}: {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
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

/* ──────────── collapsible section ──────────── */

function SectionToggle({
  title,
  icon,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button type="button" className="flex items-center gap-2 w-full text-left group py-1">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
          )}
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {title}
          </span>
          {(count ?? 0) > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{count}</span>
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pt-3 space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

/* ──────────── fake schedule data ──────────── */

const fakeSchedule = [
  { n: 1, date: "22.03.2026", payment: 50109, principal: 15109, interest: 35000, balance: 10484891, early: 0 },
  { n: 2, date: "22.04.2026", payment: 50109, principal: 15612, interest: 34497, balance: 10469279, early: 0 },
  { n: 3, date: "22.05.2026", payment: 50109, principal: 15613, interest: 34496, balance: 10453666, early: 0 },
  { n: 4, date: "22.06.2026", payment: 50109, principal: 15717, interest: 34392, balance: 10437949, early: 0 },
  { n: 5, date: "22.07.2026", payment: 50109, principal: 15822, interest: 34287, balance: 10422127, early: 0 },
  { n: 6, date: "22.08.2026", payment: 50109, principal: 15928, interest: 34181, balance: 10406199, early: 0 },
  { n: 7, date: "22.09.2026", payment: 50109, principal: 16035, interest: 34074, balance: 10390164, early: 0 },
  { n: 8, date: "22.10.2026", payment: 50109, principal: 16143, interest: 33966, balance: 10374021, early: 0 },
  { n: 9, date: "22.11.2026", payment: 50109, principal: 16252, interest: 33857, balance: 10357769, early: 0 },
  { n: 10, date: "22.12.2026", payment: 50109, principal: 16362, interest: 33747, balance: 10341407, early: 0 },
  { n: 11, date: "22.01.2027", payment: 50109, principal: 16473, interest: 33636, balance: 10324934, early: 30000 },
  { n: 12, date: "22.02.2027", payment: 47800, principal: 14300, interest: 33500, balance: 10280634, early: 30000 },
  { n: 13, date: "22.03.2027", payment: 47800, principal: 14510, interest: 33290, balance: 10236124, early: 30000 },
  { n: 14, date: "22.04.2027", payment: 47800, principal: 14723, interest: 33077, balance: 10191401, early: 30000 },
  { n: 15, date: "22.05.2027", payment: 47800, principal: 14938, interest: 32862, balance: 10146463, early: 30000 },
  { n: 16, date: "22.06.2027", payment: 47800, principal: 15155, interest: 32645, balance: 10101308, early: 30000 },
  { n: 17, date: "22.07.2027", payment: 47800, principal: 15374, interest: 32426, balance: 10055934, early: 0 },
  { n: 18, date: "22.08.2027", payment: 47800, principal: 15596, interest: 32204, balance: 10010338, early: 0 },
  { n: 19, date: "22.09.2027", payment: 47800, principal: 15820, interest: 31980, balance: 9964518, early: 0 },
  { n: 20, date: "22.10.2027", payment: 47800, principal: 16046, interest: 31754, balance: 9918472, early: 0 },
  { n: 21, date: "22.11.2027", payment: 47800, principal: 16275, interest: 31525, balance: 9872197, early: 0 },
  { n: 22, date: "22.12.2027", payment: 47800, principal: 16506, interest: 31294, balance: 9825691, early: 0 },
  { n: 23, date: "22.01.2028", payment: 47800, principal: 16740, interest: 31060, balance: 9778951, early: 0 },
  { n: 24, date: "22.02.2028", payment: 47800, principal: 16976, interest: 30824, balance: 9731975, early: 0 },
];

const totalPayment = fakeSchedule.reduce((s, r) => s + r.payment, 0);
const totalPrincipal = fakeSchedule.reduce((s, r) => s + r.principal, 0);
const totalInterest = fakeSchedule.reduce((s, r) => s + r.interest, 0);
const totalEarly = fakeSchedule.reduce((s, r) => s + r.early, 0);

function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

/* ──────────── page ──────────── */

let nextId = 1;

const CreditCalculator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Войдите в аккаунт", description: "Для сохранения расчётов нужна авторизация.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
      navigate("/auth");
      return;
    }
    setSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    if (!user || !saveTitle.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("saved_calculations").insert({
      user_id: user.id,
      title: saveTitle.trim(),
      calculator_type: "credit",
      parameters: { amount: "10 500 000 ₽", rate: "4%", term: "25 лет", type: "Аннуитетный" },
      result: { monthlyPayment: "50 109 ₽", overpayment: "7 783 442 ₽", totalPayment: "18 283 442 ₽" },
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
    exportCalculationPdf({
      title: "Кредитный калькулятор — Результаты расчёта",
      summary: [
        { label: "Ежемесячный платёж", value: "50 109 ₽" },
        { label: "Начисленные проценты", value: "7 783 442 ₽" },
        { label: "Досрочные погашения", value: "180 000 ₽" },
        { label: "Фактический срок", value: "24 года 8 мес." },
        { label: "Переплата", value: "74.1%" },
        { label: "Итого выплачено", value: "18 283 442 ₽" },
      ],
      debtBreakdown: { principal: totalPrincipal, interest: totalInterest },
      schedule: fakeSchedule,
      totals: { payment: totalPayment, principal: totalPrincipal, interest: totalInterest, early: totalEarly },
    });
  };

  const [rates, setRates] = useState<RateRow[]>([]);
  const addRate = () => setRates((p) => [...p, { id: nextId++, date: "", rate: "", recalc: "payment" }]);
  const removeRate = (id: number) => setRates((p) => p.filter((r) => r.id !== id));

  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const addEarlyPayment = () =>
    setEarlyPayments((p) => [...p, { id: nextId++, date: "", amount: "", period: "once", recalc: "payment" }]);
  const removeEarlyPayment = (id: number) => setEarlyPayments((p) => p.filter((r) => r.id !== id));

  const [commonPayments, setCommonPayments] = useState<CommonPayment[]>([]);
  const addCommonPayment = () =>
    setCommonPayments((p) => [...p, { id: nextId++, date: "", amount: "", recalc: "payment" }]);
  const removeCommonPayment = (id: number) => setCommonPayments((p) => p.filter((r) => r.id !== id));

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const addHoliday = () => setHolidays((p) => [...p, { id: nextId++, start: "", months: "", payment: "none" }]);
  const removeHoliday = (id: number) => setHolidays((p) => p.filter((r) => r.id !== id));

  const [firstPayInterest, setFirstPayInterest] = useState(false);
  const [roundPayment, setRoundPayment] = useState(false);
  const [transferWeekend, setTransferWeekend] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Кредитный калькулятор онлайн с досрочным погашением 2026</title>
        <meta name="description" content="Рассчитайте ежемесячный платёж, переплату и график погашения кредита. Калькулятор с досрочным погашением, изменением ставки и кредитными каникулами. Бесплатно." />
        <link rel="canonical" href="https://neat-app-styles.lovable.app/credit-calculator" />
        <meta property="og:title" content="Кредитный калькулятор онлайн с досрочным погашением" />
        <meta property="og:description" content="Рассчитайте ежемесячный платёж, переплату и график погашения кредита. Бесплатный онлайн калькулятор." />
        <meta property="og:url" content="https://neat-app-styles.lovable.app/credit-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ru_RU" />
        <meta name="twitter:title" content="Кредитный калькулятор онлайн с досрочным погашением" />
        <meta name="twitter:description" content="Рассчитайте ежемесячный платёж, переплату и график погашения кредита. Бесплатный онлайн калькулятор." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Кредитный калькулятор с досрочным погашением",
              "description": "Онлайн калькулятор для расчёта ежемесячного платежа, переплаты и графика погашения кредита с учётом досрочных платежей, изменения ставки и кредитных каникул.",
              "url": "https://neat-app-styles.lovable.app/credit-calculator",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "RUB"
              },
              "inLanguage": "ru"
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://neat-app-styles.lovable.app/" },
                { "@type": "ListItem", "position": 2, "name": "Кредитный калькулятор", "item": "https://neat-app-styles.lovable.app/credit-calculator" }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                { "@type": "Question", "name": "Насколько точен онлайн-калькулятор кредита?", "acceptedAnswer": { "@type": "Answer", "text": "Наш калькулятор использует стандартные банковские формулы для расчёта аннуитетных и дифференцированных платежей. Результат максимально приближен к реальному графику банка." } },
                { "@type": "Question", "name": "Что лучше: уменьшать платёж или срок при досрочном погашении?", "acceptedAnswer": { "@type": "Answer", "text": "С точки зрения экономии на процентах, уменьшение срока всегда выгоднее. Однако уменьшение платежа даёт больше финансовой гибкости." } },
                { "@type": "Question", "name": "Как влияют кредитные каникулы на переплату?", "acceptedAnswer": { "@type": "Answer", "text": "Во время кредитных каникул проценты продолжают начисляться на остаток долга. Это увеличивает общую переплату и может удлинить срок кредита." } },
                { "@type": "Question", "name": "Можно ли рассчитать ипотеку с этим калькулятором?", "acceptedAnswer": { "@type": "Answer", "text": "Да, калькулятор подходит для расчёта любого кредита с фиксированным графиком — ипотека, потребительский кредит, автокредит." } },
                { "@type": "Question", "name": "Зачем нужна функция «изменение ставки»?", "acceptedAnswer": { "@type": "Answer", "text": "Многие кредиты имеют плавающую ставку. Функция позволяет задать конкретную дату и новую ставку, чтобы увидеть, как это повлияет на платежи." } },
                { "@type": "Question", "name": "Как рассчитать экономию на досрочных погашениях?", "acceptedAnswer": { "@type": "Answer", "text": "Сделайте два расчёта: один без досрочных платежей, второй — с ними. Сравните итоговые суммы переплаты. Наш калькулятор показывает экономию автоматически." } }
              ]
            }
          ]
        })}</script>
      </Helmet>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-5xl py-3 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors"
          >
            UI Kit
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Кредитный калькулятор</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="container max-w-7xl py-6 space-y-6">
        <nav aria-label="Хлебные крошки">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Главная</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Кредитный калькулятор</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <h1 className="text-2xl font-bold tracking-tight">Кредитный калькулятор с досрочным погашением</h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ─── Left column (calculator) ─── */}
        <div className="flex-1 min-w-0 space-y-5">

        {/* ─────── Form ─────── */}
        <div className="section-card space-y-5">
          {/* Основные параметры */}
          <div className="space-y-4">
            <FormRow label="Сумма кредита">
              <Input
                formatNumber
                placeholder="10 500 000"
                className="max-w-52"
                inputEnd={<span className="text-sm font-medium">₽</span>}
              />
            </FormRow>

            <FormRow label="Срок">
              <div className="flex gap-2">
                <Input type="text" placeholder="30" className="max-w-20" />
                <Select defaultValue="years">
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="years">лет</SelectItem>
                    <SelectItem value="months">месяцев</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormRow>

            <FormRow label="Дата выдачи">
              <DatePick value={new Date("2026-02-22")} />
            </FormRow>

            <FormRow label="Ставка">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="4"
                  className="max-w-20"
                  inputEnd={<span className="text-sm font-medium">%</span>}
                />
                <button
                  type="button"
                  onClick={addRate}
                  className="text-xs text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                >
                  + Изменение ставки
                </button>
              </div>
              {rates.length > 0 && (
                <div className="rounded-md border mt-3">
                  <Table size="sm" bordered>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Ставка, %</TableHead>
                        <TableHead>Пересчитать</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rates.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <DatePick small />
                          </TableCell>
                          <TableCell>
                            <Input type="text" inputSize="sm" placeholder="%" />
                          </TableCell>
                          <TableCell>
                            <Select defaultValue="payment">
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="payment">Платёж</SelectItem>
                                <SelectItem value="term">Срок</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon-sm" onClick={() => removeRate(row.id)} aria-label="Удалить строку ставки">
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </FormRow>

            <FormRow label="Тип платежей">
              <RadioGroup defaultValue="annuity" className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="annuity" id="annuity" />
                  <Label htmlFor="annuity" className="font-normal cursor-pointer text-sm">
                    Аннуитетные
                  </Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="diff" id="diff" />
                  <Label htmlFor="diff" className="font-normal cursor-pointer text-sm">
                    Дифференцированные
                  </Label>
                </div>
              </RadioGroup>
            </FormRow>

            <FormRow label="Платежи">
              <Select defaultValue="issue_day">
                <SelectTrigger className="max-w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issue_day">В день выдачи кредита</SelectItem>
                  <SelectItem value="last_day">В последний день месяца</SelectItem>
                  {Array.from({ length: 30 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1}-е число месяца
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
          </div>

          <Separator />

          {/* Опции */}
          <div className="space-y-2.5 sm:pl-52">
            <div className="flex items-center gap-2">
              <Checkbox id="fpi" checked={firstPayInterest} onCheckedChange={(v) => setFirstPayInterest(v === true)} />
              <Label htmlFor="fpi" className="font-normal cursor-pointer text-sm">
                Первый платёж – только проценты
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="round" checked={roundPayment} onCheckedChange={(v) => setRoundPayment(v === true)} />
              <Label htmlFor="round" className="font-normal cursor-pointer text-sm">
                Округлять платёж
              </Label>
              {roundPayment && (
                <Select defaultValue="rub">
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rub">До рублей</SelectItem>
                    <SelectItem value="hundred">До сотен</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="tw" checked={transferWeekend} onCheckedChange={(v) => setTransferWeekend(v === true)} />
              <Label htmlFor="tw" className="font-normal cursor-pointer text-sm">
                Переносить с выходных
              </Label>
              {transferWeekend && (
                <Select defaultValue="next">
                  <SelectTrigger className="h-7 w-52 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next">На следующий рабочий</SelectItem>
                    <SelectItem value="prev">На предыдущий рабочий</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Separator />

          {/* Collapsible sections */}
          <div className="space-y-3">
            <SectionToggle
              title="Досрочные погашения"
              icon={<TrendingDown className="h-4 w-4" />}
              count={earlyPayments.length}
            >
              {earlyPayments.map((row) => (
                <div key={row.id} className="flex items-center gap-2 flex-wrap">
                  <DatePick small />
                  <Input type="text" inputSize="sm" placeholder="Сумма" className="w-28" />
                  <Select defaultValue="once">
                    <SelectTrigger className="h-8 text-xs w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Разовый</SelectItem>
                      <SelectItem value="1M">Каждый месяц</SelectItem>
                      <SelectItem value="3M">Каждые 3 мес.</SelectItem>
                      <SelectItem value="6M">Каждые 6 мес.</SelectItem>
                      <SelectItem value="1Y">Каждый год</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="payment">
                    <SelectTrigger className="h-8 text-xs w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Уменьшить платёж</SelectItem>
                      <SelectItem value="term">Уменьшить срок</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeEarlyPayment(row.id)} aria-label="Удалить досрочное погашение">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <button
                type="button"
                onClick={addEarlyPayment}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" /> Добавить
              </button>
            </SectionToggle>

            <SectionToggle
              title="Общий ежемесячный платёж"
              icon={<Wallet className="h-4 w-4" />}
              count={commonPayments.length}
            >
              {commonPayments.map((row) => (
                <div key={row.id} className="flex items-center gap-2 flex-wrap">
                  <DatePick small />
                  <Input type="text" inputSize="sm" placeholder="Сумма" className="w-28" />
                  <Select defaultValue="payment">
                    <SelectTrigger className="h-8 text-xs w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Уменьшить платёж</SelectItem>
                      <SelectItem value="term">Уменьшить срок</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeCommonPayment(row.id)} aria-label="Удалить ежемесячный платёж">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCommonPayment}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" /> Добавить
              </button>
            </SectionToggle>

            <SectionToggle
              title="Кредитные каникулы"
              icon={<CalendarOff className="h-4 w-4" />}
              count={holidays.length}
            >
              {holidays.map((row) => (
                <div key={row.id} className="flex items-center gap-2 flex-wrap">
                  <DatePick small />
                  <Input type="text" inputSize="sm" placeholder="Месяцев" className="w-24" />
                  <Select defaultValue="none">
                    <SelectTrigger className="h-8 text-xs w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без платежей</SelectItem>
                      <SelectItem value="interest">Только проценты</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeHoliday(row.id)} aria-label="Удалить каникулы">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <button
                type="button"
                onClick={addHoliday}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" /> Добавить
              </button>
            </SectionToggle>
          </div>

          <Separator />

          {/* Submit */}
          <div className="flex items-center gap-3 sm:pl-52">
            <Button icon={<Calculator className="h-4 w-4" />}>Рассчитать</Button>
          </div>
        </div>

        {/* ─────── Results ─────── */}
        <section className="section-card space-y-5" aria-labelledby="results-heading">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 id="results-heading" className="text-lg font-semibold">Результаты расчёта</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer />}
                onClick={() => window.print()}
              >
                Печать
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<FileDown />}
                onClick={handleExportPdf}
              >
                Сохранить в PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Save />}
                onClick={handleSave}
              >
                Сохранить
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Ежемесячный платёж", value: "50 109 ₽", sub: "→ 47 800 ₽ после пересчёта" },
              { label: "Начисленные проценты", value: "7 783 442 ₽", color: "text-destructive" },
              { label: "Досрочные погашения", value: "180 000 ₽", color: "text-[hsl(var(--success))]" },
              { label: "Фактический срок", value: "24 года 8 мес." },
              { label: "Переплата", value: "74.1%", color: "text-destructive" },
              { label: "Итого выплачено", value: "18 283 442 ₽" },
            ].map((item) => (
              <div key={item.label} className="form-section space-y-1">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-lg font-semibold font-mono ${item.color ?? "text-foreground"}`}>{item.value}</p>
                {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
              </div>
            ))}
          </div>

          {/* Pie chart */}
          <div role="figure" aria-label={`Круговая диаграмма: основной долг ${fmt(totalPrincipal)} ₽, проценты ${fmt(totalInterest)} ₽`}>
            <h3 className="text-sm font-medium mb-3">Тело долга и проценты</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Основной долг", value: totalPrincipal },
                        { name: "Проценты", value: totalInterest },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      <Cell fill="hsl(var(--success))" />
                      <Cell fill="hsl(var(--destructive))" />
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
                  <span className="text-sm font-semibold font-mono">{fmt(totalPrincipal)} ₽</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm text-muted-foreground">Проценты</span>
                  <span className="text-sm font-semibold font-mono">{fmt(totalInterest)} ₽</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bar chart - monthly breakdown */}
          <div role="figure" aria-label="Столбчатая диаграмма: разбивка платежей по месяцам на основной долг и проценты">
            <h3 className="text-sm font-medium mb-3">Разбивка платежей по месяцам</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={fakeSchedule.map((row) => ({
                    date: row.date.slice(3),
                    principal: row.principal,
                    interest: row.interest,
                  }))}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
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
                      name === "principal" ? "Основной долг" : "Проценты",
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
                    formatter={(value) => (value === "principal" ? "Основной долг" : "Проценты")}
                    wrapperStyle={{ fontSize: "0.75rem" }}
                  />
                  <Bar dataKey="principal" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="interest" stackId="a" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Schedule table with sticky header & footer */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h3 className="text-sm font-medium">График погашения</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" icon={<FileDown />}>
                  Excel
                </Button>
                <Button variant="outline" size="sm" icon={<FileDown />} onClick={handleExportPdf}>
                  PDF
                </Button>
                <Button variant="outline" size="sm" icon={<Printer />}>
                  Печать
                </Button>
              </div>
            </div>
            <div className="rounded-md border relative overflow-auto max-h-[480px]">
              <Table size="sm" striped hoverable>
                <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                  <TableRow className="border-b-0">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Платёж</TableHead>
                    <TableHead className="text-right">Основной долг</TableHead>
                    <TableHead className="text-right">Проценты</TableHead>
                    <TableHead className="text-right">Досрочное</TableHead>
                    <TableHead className="text-right">Остаток</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fakeSchedule.map((row) => (
                    <TableRow key={row.n}>
                      <TableCell className="font-mono text-muted-foreground text-xs">{row.n}</TableCell>
                      <TableCell className="text-xs">{row.date}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(row.payment)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-[hsl(var(--success))]">
                        {fmt(row.principal)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-destructive">
                        {fmt(row.interest)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {row.early > 0 ? (
                          <span className="text-[hsl(var(--success))] font-medium">{fmt(row.early)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(row.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="sticky bottom-0 z-10 bg-card shadow-[0_-1px_0_0_hsl(var(--border))]">
                  <TableRow className="border-t-0 font-semibold">
                    <TableCell colSpan={2} className="text-xs">
                      Итого
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmt(totalPayment)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-[hsl(var(--success))]">
                      {fmt(totalPrincipal)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-destructive">
                      {fmt(totalInterest)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-[hsl(var(--success))]">
                      {fmt(totalEarly)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">—</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </section>
        </div>

        {/* ─── Right sidebar ─── */}
        <aside className="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-6">
          {/* Ad block */}
          <div className="section-card">
            <p className="text-xs text-muted-foreground mb-2">Реклама</p>
            <div className="rounded-md bg-muted/50 border border-dashed border-border-subtle flex items-center justify-center h-60">
              <span className="text-xs text-muted-foreground">Рекламный блок</span>
            </div>
          </div>

          {/* Related calculators */}
          <div className="section-card space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Кредитные калькуляторы</p>
            <nav aria-label="Кредитные калькуляторы" className="space-y-1">
              {[
                "Ипотечный калькулятор",
                "Калькулятор рефинансирования",
                "Калькулятор досрочного погашения",
                "Калькулятор автокредита",
                "Калькулятор переплаты",
              ].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="block text-sm text-foreground hover:text-primary transition-colors py-1"
                >
                  {name}
                </a>
              ))}
            </nav>
          </div>

          {/* Other categories */}
          <div className="section-card space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Другие категории</p>
            <nav aria-label="Другие категории калькуляторов" className="space-y-1">
              {[
                "Вклады и депозиты",
                "Налоговые калькуляторы",
                "Зарплатные калькуляторы",
                "Инвестиции",
                "Пенсионные калькуляторы",
              ].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="block text-sm text-foreground hover:text-primary transition-colors py-1"
                >
                  {name}
                </a>
              ))}
            </nav>
          </div>
        </aside>
        </div>
      </main>

      <footer className="border-t py-6 mt-8">
        <div className="container max-w-5xl">
          <p className="text-xs text-muted-foreground text-center">
            UI Kit · Кредитный калькулятор с досрочным погашением
          </p>
        </div>
      </footer>
      {/* Save dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранить расчёт</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="save-title">Название расчёта</Label>
            <Input
              id="save-title"
              placeholder="Например: Ипотека Сбербанк 4%"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveTitle.trim() && confirmSave()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Отмена</Button>
            <Button onClick={confirmSave} disabled={!saveTitle.trim() || saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreditCalculator;
