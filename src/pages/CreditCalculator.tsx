import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Info,
  Calculator,
  Clock,
  ChevronDown,
} from "lucide-react";

/* ───────────────────── helpers ───────────────────── */

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
      <div className="sm:w-52 shrink-0 flex items-center gap-1 sm:justify-end sm:pt-2">
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

/* ──────────── page ──────────── */

let nextId = 1;

const CreditCalculator = () => {
  /* rates */
  const [rates, setRates] = useState<RateRow[]>([]);
  const addRate = () =>
    setRates((prev) => [
      ...prev,
      { id: nextId++, date: "", rate: "", recalc: "payment" },
    ]);
  const removeRate = (id: number) =>
    setRates((prev) => prev.filter((r) => r.id !== id));

  /* early payments */
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const addEarlyPayment = () =>
    setEarlyPayments((prev) => [
      ...prev,
      { id: nextId++, date: "", amount: "", period: "once", recalc: "payment" },
    ]);
  const removeEarlyPayment = (id: number) =>
    setEarlyPayments((prev) => prev.filter((r) => r.id !== id));

  /* common payments */
  const [commonPayments, setCommonPayments] = useState<CommonPayment[]>([]);
  const addCommonPayment = () =>
    setCommonPayments((prev) => [
      ...prev,
      { id: nextId++, date: "", amount: "", recalc: "payment" },
    ]);
  const removeCommonPayment = (id: number) =>
    setCommonPayments((prev) => prev.filter((r) => r.id !== id));

  /* holidays */
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const addHoliday = () =>
    setHolidays((prev) => [
      ...prev,
      { id: nextId++, start: "", months: "", payment: "none" },
    ]);
  const removeHoliday = (id: number) =>
    setHolidays((prev) => prev.filter((r) => r.id !== id));

  /* checkboxes */
  const [firstPayInterest, setFirstPayInterest] = useState(false);
  const [skipFirstMonth, setSkipFirstMonth] = useState(false);
  const [increaseToInterest, setIncreaseToInterest] = useState(false);
  const [roundPayment, setRoundPayment] = useState(false);
  const [transferWeekend, setTransferWeekend] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-5xl py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors">
            UI Kit
          </Link>
          <span className="text-xs text-muted-foreground">Кредитный калькулятор</span>
        </div>
      </header>

      <main className="container max-w-5xl py-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Кредитный калькулятор с досрочным погашением</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-bold tracking-tight">
          Кредитный калькулятор с досрочным погашением
        </h1>

        {/* ─────── Form Card ─────── */}
        <div className="section-card space-y-5">
          {/* Сумма кредита */}
          <FormRow label="Сумма кредита">
            <Input
              type="text"
              placeholder="10 500 000"
              inputEnd={<span className="text-sm font-medium">₽</span>}
            />
          </FormRow>

          {/* Срок кредита */}
          <FormRow label="Срок кредита">
            <div className="flex gap-2">
              <Input type="text" placeholder="30" className="max-w-28" />
              <Select defaultValue="years">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="years">лет</SelectItem>
                  <SelectItem value="months">месяцев</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FormRow>

          {/* Дата выдачи */}
          <FormRow label="Дата выдачи кредита">
            <Input type="date" defaultValue="2026-02-22" className="max-w-44" />
          </FormRow>

          {/* Процентная ставка */}
          <FormRow label="Процентная ставка">
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="4"
                className="max-w-28"
                inputEnd={<span className="text-sm font-medium">%</span>}
              />

              {/* Rate changes table */}
              {rates.length > 0 && (
                <div className="rounded-md border">
                  <Table size="sm" bordered>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата, с которой действует</TableHead>
                        <TableHead>Ставка, %</TableHead>
                        <TableHead>Пересчитать</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rates.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Input type="date" inputSize="sm" />
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
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeRate(row.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <button
                type="button"
                onClick={addRate}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Добавить ставку
              </button>
            </div>
          </FormRow>

          <Separator />

          {/* Тип ежемесячных платежей */}
          <FormRow
            label="Тип ежемесячных платежей"
          >
            <RadioGroup defaultValue="annuity" className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="annuity" id="annuity" />
                <Label htmlFor="annuity" className="font-normal cursor-pointer">
                  Аннуитетные
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Ежемесячные платежи одинаковы на протяжении всего срока кредита
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="diff" id="diff" />
                <Label htmlFor="diff" className="font-normal cursor-pointer">
                  Дифференцированные
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Основной долг делится равными частями, проценты начисляются на остаток
                  </TooltipContent>
                </Tooltip>
              </div>
            </RadioGroup>
          </FormRow>

          {/* Ежемесячные платежи */}
          <FormRow label="Ежемесячные платежи">
            <Select defaultValue="issue_day">
              <SelectTrigger className="max-w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issue_day">в день выдачи кредита</SelectItem>
                <SelectItem value="last_day">в последний день месяца</SelectItem>
                {Array.from({ length: 30 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1}-е число каждого месяца
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          {/* Чекбоксы */}
          <FormRow label="" className="sm:pl-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="firstPayInterest"
                  checked={firstPayInterest}
                  onCheckedChange={(v) => setFirstPayInterest(v === true)}
                />
                <Label htmlFor="firstPayInterest" className="font-normal cursor-pointer">
                  Первый платёж – только проценты
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="skipFirstMonth"
                  checked={skipFirstMonth}
                  onCheckedChange={(v) => setSkipFirstMonth(v === true)}
                />
                <Label htmlFor="skipFirstMonth" className="font-normal cursor-pointer">
                  Пропустить первый месяц
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="increaseToInterest"
                  checked={increaseToInterest}
                  onCheckedChange={(v) => setIncreaseToInterest(v === true)}
                />
                <Label htmlFor="increaseToInterest" className="font-normal cursor-pointer">
                  Увеличить ЕП до размера процентов
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Если ежемесячный платёж меньше начисленных процентов, он будет увеличен
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="roundPayment"
                  checked={roundPayment}
                  onCheckedChange={(v) => setRoundPayment(v === true)}
                  className="mt-0.5"
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="roundPayment" className="font-normal cursor-pointer">
                    Округлять платёж
                  </Label>
                  {roundPayment && (
                    <Select defaultValue="rub">
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rub">До рублей</SelectItem>
                        <SelectItem value="hundred">До сотен</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="transferWeekend"
                  checked={transferWeekend}
                  onCheckedChange={(v) => setTransferWeekend(v === true)}
                  className="mt-0.5"
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="transferWeekend" className="font-normal cursor-pointer">
                    Переносить платёж с выходных дней
                  </Label>
                  {transferWeekend && (
                    <Select defaultValue="next">
                      <SelectTrigger className="h-8 w-56 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="next">На следующий рабочий день</SelectItem>
                        <SelectItem value="prev">На предыдущий рабочий день</SelectItem>
                        <SelectItem value="sun_mon">Только с ВС на ПН</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </FormRow>

          <Separator />

          {/* ─── Досрочные погашения ─── */}
          <FormRow label="Досрочные погашения">
            <div className="space-y-3">
              {earlyPayments.length > 0 && (
                <div className="rounded-md border">
                  <Table size="sm" bordered>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Периодичность</TableHead>
                        <TableHead>Пересчитать</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earlyPayments.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Input type="date" inputSize="sm" />
                          </TableCell>
                          <TableCell>
                            <Input type="text" inputSize="sm" placeholder="Сумма" />
                          </TableCell>
                          <TableCell>
                            <Select defaultValue="once">
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="once">Разовый</SelectItem>
                                <SelectItem value="1M">Каждый месяц</SelectItem>
                                <SelectItem value="2M">Каждые 2 месяца</SelectItem>
                                <SelectItem value="3M">Каждые 3 месяца</SelectItem>
                                <SelectItem value="6M">Каждые 6 месяцев</SelectItem>
                                <SelectItem value="1Y">Каждый год</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select defaultValue="payment">
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="payment">Уменьшить платёж</SelectItem>
                                <SelectItem value="term">Уменьшить срок</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeEarlyPayment(row.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <button
                type="button"
                onClick={addEarlyPayment}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Добавить досрочный платёж
              </button>
            </div>
          </FormRow>

          <Separator />

          {/* ─── Общий ежемесячный платёж ─── */}
          <FormRow
            label="Общий ежемесячный платёж"
            tooltip="Общий ежемесячный платёж — фиксированная сумма, которую заёмщик платит каждый месяц"
          >
            <div className="space-y-3">
              {commonPayments.length > 0 && (
                <div className="rounded-md border">
                  <Table size="sm" bordered>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата начала</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Пересчитать</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commonPayments.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Input type="date" inputSize="sm" />
                          </TableCell>
                          <TableCell>
                            <Input type="text" inputSize="sm" placeholder="Сумма" />
                          </TableCell>
                          <TableCell>
                            <Select defaultValue="payment">
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="payment">Уменьшить платёж</SelectItem>
                                <SelectItem value="term">Уменьшить срок</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeCommonPayment(row.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <button
                type="button"
                onClick={addCommonPayment}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Добавить общий ежемесячный платёж
              </button>
            </div>
          </FormRow>

          <Separator />

          {/* ─── Кредитные каникулы ─── */}
          <FormRow
            label="Кредитные каникулы"
            tooltip="Период, в течение которого заёмщик может не платить или платить только проценты"
          >
            <div className="space-y-3">
              {holidays.length > 0 && (
                <div className="rounded-md border">
                  <Table size="sm" bordered>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Начало</TableHead>
                        <TableHead>Срок (мес)</TableHead>
                        <TableHead>Платёж</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holidays.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Input type="date" inputSize="sm" />
                          </TableCell>
                          <TableCell>
                            <Input type="text" inputSize="sm" placeholder="Мес." />
                          </TableCell>
                          <TableCell>
                            <Select defaultValue="none">
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Отсутствует</SelectItem>
                                <SelectItem value="interest">Проценты</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeHoliday(row.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <button
                type="button"
                onClick={addHoliday}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Добавить кредитные каникулы
              </button>
            </div>
          </FormRow>

          <Separator />

          {/* Submit */}
          <div className="flex items-center gap-3 sm:pl-56">
            <Button icon={<Calculator className="h-4 w-4" />}>
              Рассчитать
            </Button>
            <Button variant="outline" size="icon">
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ─────── Results Placeholder ─────── */}
        <div className="section-card space-y-4">
          <h2 className="text-lg font-semibold">Результаты расчёта</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Ежемесячный платёж", value: "—" },
              { label: "Начисленные проценты", value: "—" },
              { label: "Сумма досрочных погашений", value: "—" },
              { label: "Фактический срок", value: "—" },
              { label: "Переплата", value: "—" },
              { label: "Долг + проценты", value: "—" },
            ].map((item) => (
              <div key={item.label} className="form-section space-y-1">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold font-mono">{item.value}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-3">График погашения</h3>
            <div className="rounded-md border">
              <Table size="sm" striped>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Платёж</TableHead>
                    <TableHead className="text-right">Основной долг</TableHead>
                    <TableHead className="text-right">Проценты</TableHead>
                    <TableHead className="text-right">Остаток</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Заполните форму и нажмите «Рассчитать»
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 mt-8">
        <div className="container max-w-5xl">
          <p className="text-xs text-muted-foreground text-center">
            UI Kit · Кредитный калькулятор с досрочным погашением
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CreditCalculator;
