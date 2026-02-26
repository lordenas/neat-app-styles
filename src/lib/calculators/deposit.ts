/**
 * Deposit (savings) calculator: compound interest with top-ups, withdrawals,
 * capitalization options, and tax (RU rules, 259-FZ). Pure logic, no React.
 */

export type TermUnit = "days" | "months" | "years";

export type CompoundFrequency = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";

export type PayoutFrequency = "end" | "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";

export type OneTimeTopUp = {
  date: string; // YYYY-MM-DD
  amount: number;
};

export type RegularTopUp = {
  startDate: string;
  endDate?: string;
  period: "1M" | "2M" | "3M" | "6M" | "1Y";
  amount: number;
};

export type OneTimeWithdrawal = {
  date: string;
  amount: number;
};

export type RegularWithdrawal = {
  startDate: string;
  endDate?: string;
  period: "1M" | "2M" | "3M" | "6M" | "1Y";
  amount: number;
};

// Legacy compat (used by old code)
export type CapitalizationType = "monthly" | "quarterly" | "endOfTerm" | "none";
export type OneTimeTransaction = { month: number; amount: number };

export type DepositInput = {
  principal: number;
  startDate: string;
  term: number;
  termUnit: TermUnit;
  annualRatePercent: number;
  capitalization: boolean;
  compoundFrequency: CompoundFrequency;
  payoutFrequency: PayoutFrequency;
  oneTimeTopUps: OneTimeTopUp[];
  regularTopUps: RegularTopUp[];
  oneTimeWithdrawals: OneTimeWithdrawal[];
  regularWithdrawals: RegularWithdrawal[];
  minimumBalance: number;
  keyRatePercent?: number;
  keyRatesByYear?: Record<number, number>;
  taxRatePercent?: number;
};

export type DepositScheduleRow = {
  date: string;
  eventType: string;
  label: string;
  amountDelta: number;
  interestAccrued: number;
  balance: number;
};

export type DepositTaxRow = {
  year: number;
  income: number;
  deduction: number;
  taxableIncome: number;
  taxAmount: number;
  payByDate: string;
};

export type DepositResult = {
  totalInterest: number;
  finalBalance: number;
  totalReturn: number;
  totalTopUps: number;
  totalWithdrawals: number;
  netIncome: number;
  effectiveRatePercent: number;
  schedule: DepositScheduleRow[];
  taxRows: DepositTaxRow[];
  totalTax: number;
  blockedWithdrawals: { date: string; amount: number }[];
};

// ─── date utils ───────────────────────────────────────────────────────────────

const toDate = (s: string): Date => {
  const d = new Date(s + "T00:00:00");
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
};

const formatDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (d: Date, days: number): Date => {
  const r = new Date(d); r.setDate(r.getDate() + days); return r;
};
const addMonths = (d: Date, months: number): Date => {
  const r = new Date(d); r.setMonth(r.getMonth() + months); return r;
};
const addYears = (d: Date, years: number): Date => addMonths(d, years * 12);
const daysBetween = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / 86400000);
const round2 = (x: number) => Math.round(x * 100) / 100;

const DEFAULT_KEY_RATE_BY_YEAR: Record<number, number> = {
  2024: 16, 2025: 16, 2026: 16, 2027: 15.5, 2028: 15.5, 2029: 15.5, 2030: 15.5,
};

function yearsBetween(a: Date, b: Date): number {
  return daysBetween(a, b) / 365;
}

function calculateXirr(cashflows: Array<{ date: Date; amount: number }>, guess = 0.1): number | null {
  if (cashflows.length < 2) return null;
  const hasPositive = cashflows.some((c) => c.amount > 0);
  const hasNegative = cashflows.some((c) => c.amount < 0);
  if (!hasPositive || !hasNegative) return null;
  const t0 = cashflows[0].date;
  const npv = (rate: number) => cashflows.reduce((acc, c) => {
    const t = yearsBetween(t0, c.date);
    return acc + c.amount / Math.pow(1 + rate, t);
  }, 0);
  const dNpv = (rate: number) => cashflows.reduce((acc, c) => {
    const t = yearsBetween(t0, c.date);
    if (t === 0) return acc;
    return acc - (t * c.amount) / Math.pow(1 + rate, t + 1);
  }, 0);
  let rate = guess;
  for (let i = 0; i < 80; i++) {
    const f = npv(rate); const df = dNpv(rate);
    if (!Number.isFinite(f) || !Number.isFinite(df) || Math.abs(df) < 1e-12) break;
    const next = rate - f / df;
    if (!Number.isFinite(next) || next <= -0.999999 || next > 1000) break;
    if (Math.abs(next - rate) < 1e-9) { rate = next; break; }
    rate = next;
  }
  if (!Number.isFinite(rate) || rate <= -0.999999) return null;
  return rate;
}

function getEndDate(start: Date, term: number, unit: TermUnit): Date {
  switch (unit) {
    case "days": return addDays(start, term);
    case "months": return addMonths(start, term);
    case "years": return addYears(start, term);
    default: return addMonths(start, term);
  }
}

function regularDates(start: Date, end: Date, period: "1M" | "2M" | "3M" | "6M" | "1Y"): Date[] {
  const out: Date[] = [];
  let d = new Date(start);
  const months = period === "1M" ? 1 : period === "2M" ? 2 : period === "3M" ? 3 : period === "6M" ? 6 : 12;
  while (d <= end) { out.push(new Date(d)); d = addMonths(d, months); }
  return out;
}

function nextCompoundDate(d: Date, freq: CompoundFrequency): Date {
  switch (freq) {
    case "1D": return addDays(d, 1);
    case "1W": return addDays(d, 7);
    case "1M": return addMonths(d, 1);
    case "3M": return addMonths(d, 3);
    case "6M": return addMonths(d, 6);
    case "1Y": return addYears(d, 1);
    default: return addMonths(d, 1);
  }
}

function compoundDates(start: Date, end: Date, freq: CompoundFrequency): Date[] {
  const out: Date[] = [];
  let d = nextCompoundDate(new Date(start), freq);
  while (d <= end) { out.push(new Date(d)); d = nextCompoundDate(d, freq); }
  return out;
}

function payoutDates(start: Date, end: Date, freq: PayoutFrequency): Date[] {
  if (freq === "end") return [new Date(end)];
  const cf: CompoundFrequency = freq as CompoundFrequency;
  return compoundDates(start, end, cf);
}

type TimelineEvent =
  | { type: "start"; date: Date }
  | { type: "end"; date: Date }
  | { type: "topup"; date: Date; amount: number }
  | { type: "withdrawal"; date: Date; amount: number }
  | { type: "interest"; date: Date };

function buildTimeline(input: DepositInput): { events: TimelineEvent[]; endDate: Date } {
  const start = toDate(input.startDate);
  const endDate = getEndDate(start, input.term, input.termUnit);
  const events: TimelineEvent[] = [];

  events.push({ type: "start", date: start });
  events.push({ type: "end", date: endDate });

  for (const t of input.oneTimeTopUps) {
    const d = toDate(t.date);
    if (d >= start && d <= endDate && t.amount > 0)
      events.push({ type: "topup", date: d, amount: t.amount });
  }
  for (const r of input.regularTopUps) {
    const rEnd = r.endDate ? toDate(r.endDate) : endDate;
    const rStart = toDate(r.startDate);
    for (const d of regularDates(rStart, rEnd > endDate ? endDate : rEnd, r.period))
      if (d >= start && d <= endDate && r.amount > 0)
        events.push({ type: "topup", date: d, amount: r.amount });
  }
  for (const w of input.oneTimeWithdrawals) {
    const d = toDate(w.date);
    if (d >= start && d <= endDate && w.amount > 0)
      events.push({ type: "withdrawal", date: d, amount: w.amount });
  }
  for (const r of input.regularWithdrawals) {
    const rEnd = r.endDate ? toDate(r.endDate) : endDate;
    const rStart = toDate(r.startDate);
    for (const d of regularDates(rStart, rEnd > endDate ? endDate : rEnd, r.period))
      if (d >= start && d <= endDate && r.amount > 0)
        events.push({ type: "withdrawal", date: d, amount: r.amount });
  }

  if (input.capitalization) {
    for (const d of compoundDates(start, endDate, input.compoundFrequency))
      events.push({ type: "interest", date: d });
  } else {
    for (const d of payoutDates(start, endDate, input.payoutFrequency))
      events.push({ type: "interest", date: d });
  }

  const order: Record<string, number> = { start: 0, interest: 1, topup: 2, withdrawal: 3, end: 4 };
  events.sort((a, b) => {
    const t = a.date.getTime() - b.date.getTime();
    return t !== 0 ? t : (order[a.type] ?? 5) - (order[b.type] ?? 5);
  });
  return { events, endDate };
}

export function calculateDeposit(input: DepositInput): DepositResult {
  const minBal = Math.max(0, input.minimumBalance ?? 0);
  const keyRate = input.keyRatePercent ?? 0;
  const taxRate = input.taxRatePercent ?? 13;

  const { events, endDate } = buildTimeline(input);
  const start = toDate(input.startDate);

  let balance = Math.max(0, input.principal);
  const rate = input.annualRatePercent / 100;
  let interestCursorDate = start;
  let accruedInterest = 0;
  let totalInterest = 0;
  let totalTopUps = input.principal;
  let totalWithdrawals = 0;
  const blockedWithdrawals: { date: string; amount: number }[] = [];
  const schedule: DepositScheduleRow[] = [];
  const interestByYear: Record<number, number> = {};
  const cashflows: Array<{ date: Date; amount: number }> = [{ date: start, amount: -Math.max(0, input.principal) }];

  for (const ev of events) {
    const dateStr = formatDate(ev.date);

    if (ev.type === "start") {
      schedule.push({ date: dateStr, eventType: "deposit", label: "Начальная сумма", amountDelta: balance, interestAccrued: 0, balance: round2(balance) });
      continue;
    }

    const elapsedDays = daysBetween(interestCursorDate, ev.date);
    if (elapsedDays > 0) {
      accruedInterest += (balance * rate * elapsedDays) / 365;
      interestCursorDate = ev.date;
    }

    if (ev.type === "end") {
      schedule.push({ date: dateStr, eventType: "end", label: "Итого", amountDelta: 0, interestAccrued: 0, balance: round2(balance) });
      continue;
    }

    if (ev.type === "interest") {
      const interestAccrued = round2(accruedInterest);
      accruedInterest = 0;
      totalInterest += interestAccrued;
      const year = ev.date.getFullYear();
      interestByYear[year] = (interestByYear[year] ?? 0) + interestAccrued;
      if (input.capitalization) {
        balance = round2(balance + interestAccrued);
        schedule.push({ date: dateStr, eventType: "interest", label: "Капитализация", amountDelta: interestAccrued, interestAccrued, balance });
      } else {
        schedule.push({ date: dateStr, eventType: "payout", label: "Выплата процентов", amountDelta: 0, interestAccrued, balance });
      }
      continue;
    }

    if (ev.type === "topup") {
      balance = round2(balance + ev.amount);
      totalTopUps += ev.amount;
      cashflows.push({ date: ev.date, amount: -ev.amount });
      schedule.push({ date: dateStr, eventType: "topup", label: "Пополнение", amountDelta: ev.amount, interestAccrued: 0, balance });
      continue;
    }

    if (ev.type === "withdrawal") {
      const after = round2(balance - ev.amount);
      if (after < minBal) {
        blockedWithdrawals.push({ date: dateStr, amount: ev.amount });
        continue;
      }
      balance = after;
      totalWithdrawals += ev.amount;
      cashflows.push({ date: ev.date, amount: ev.amount });
      schedule.push({ date: dateStr, eventType: "withdrawal", label: "Снятие", amountDelta: -ev.amount, interestAccrued: 0, balance });
    }
  }

  const totalReturn = input.capitalization ? balance : round2(balance + totalInterest);
  cashflows.push({ date: endDate, amount: totalReturn });

  const daysInTerm = Math.max(1, daysBetween(start, endDate));
  const principal = Math.max(1, input.principal);
  const effectiveRatePercent = daysInTerm > 0 && principal > 0
    ? round2((totalInterest / principal) * (365 / daysInTerm) * 100)
    : round2(((calculateXirr(cashflows, input.annualRatePercent / 100) ?? 0) * 100));

  const netInvested = totalTopUps - totalWithdrawals;
  const netIncome = round2(balance - netInvested);

  // Tax by year with deduction carry-over (259-FZ)
  const startYear = start.getFullYear();
  const endYear = endDate.getFullYear();
  const taxRows: DepositTaxRow[] = [];
  let totalTax = 0;
  let carriedDeduction = 0;
  const keyRatesByYear = input.keyRatesByYear ?? {};
  for (let year = startYear; year <= endYear; year++) {
    const rateForYear = keyRatesByYear[year] ?? DEFAULT_KEY_RATE_BY_YEAR[year] ?? keyRate;
    const deductionForYear = round2(1_000_000 * (rateForYear / 100));
    const income = round2(interestByYear[year] ?? 0);
    const availableDeduction = round2(carriedDeduction + deductionForYear);
    const deductionUsed = round2(Math.min(income, availableDeduction));
    const taxable = round2(Math.max(0, income - deductionUsed));
    carriedDeduction = income < availableDeduction ? round2(availableDeduction - income) : 0;
    const taxAmount = round2(taxable * (taxRate / 100));
    totalTax += taxAmount;
    taxRows.push({ year, income, deduction: deductionForYear, taxableIncome: taxable, taxAmount, payByDate: `${year + 1}-12-01` });
  }

  return {
    totalInterest: round2(totalInterest),
    finalBalance: round2(balance),
    totalReturn: round2(totalReturn),
    totalTopUps: round2(totalTopUps),
    totalWithdrawals: round2(totalWithdrawals),
    netIncome,
    effectiveRatePercent,
    schedule,
    taxRows,
    totalTax: round2(totalTax),
    blockedWithdrawals,
  };
}

// ─── Legacy shim for old DepositCalculator ────────────────────────────────────
// Keep old export so any existing imports still compile
export function calcDeposit(input: {
  initialAmount: number; annualRate: number; termMonths: number;
  capitalization: CapitalizationType; monthlyTopUp: number; monthlyWithdrawal: number;
  maxKeyRate: number; ndflRate?: number;
  oneTimeTopUps?: OneTimeTransaction[]; oneTimeWithdrawals?: OneTimeTransaction[];
}) {
  const start = new Date();
  const startStr = formatDate(start);
  const capBool = input.capitalization !== "none" && input.capitalization !== "endOfTerm";
  const freq: CompoundFrequency = input.capitalization === "quarterly" ? "3M" : "1M";
  const regularTopUps: RegularTopUp[] = input.monthlyTopUp > 0
    ? [{ startDate: startStr, period: "1M", amount: input.monthlyTopUp }]
    : [];
  const regularWithdrawals: RegularWithdrawal[] = input.monthlyWithdrawal > 0
    ? [{ startDate: startStr, period: "1M", amount: input.monthlyWithdrawal }]
    : [];
  const oneTimeTopUps: OneTimeTopUp[] = (input.oneTimeTopUps ?? []).map((t) => {
    const d = new Date(start); d.setMonth(d.getMonth() + t.month - 1);
    return { date: formatDate(d), amount: t.amount };
  });
  const oneTimeWithdrawals: OneTimeWithdrawal[] = (input.oneTimeWithdrawals ?? []).map((t) => {
    const d = new Date(start); d.setMonth(d.getMonth() + t.month - 1);
    return { date: formatDate(d), amount: t.amount };
  });

  const r = calculateDeposit({
    principal: input.initialAmount, startDate: startStr,
    term: input.termMonths, termUnit: "months",
    annualRatePercent: input.annualRate,
    capitalization: capBool, compoundFrequency: freq, payoutFrequency: "end",
    oneTimeTopUps, regularTopUps, oneTimeWithdrawals, regularWithdrawals,
    minimumBalance: 0, keyRatePercent: input.maxKeyRate, taxRatePercent: input.ndflRate ?? 13,
  });

  return {
    finalAmount: r.totalReturn,
    totalInterest: r.totalInterest,
    totalTopUps: r.totalTopUps - input.initialAmount,
    totalWithdrawals: r.totalWithdrawals,
    taxFreeThreshold: Math.round(1_000_000 * input.maxKeyRate / 100),
    taxableIncome: r.taxRows.reduce((s, t) => s + t.taxableIncome, 0),
    tax: r.totalTax,
    netIncome: r.netIncome,
    effectiveRate: r.effectiveRatePercent,
    schedule: r.schedule.map((row, i) => ({
      month: i, openBalance: row.balance - row.amountDelta,
      interest: row.interestAccrued, topUp: 0, withdrawal: 0, closeBalance: row.balance,
    })),
  };
}
