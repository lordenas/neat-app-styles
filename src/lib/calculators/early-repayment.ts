/**
 * Движок расчёта аннуитетных кредитов с досрочными погашениями,
 * изменениями ставки, кредитными каникулами и вспомогательными опциями.
 */

import { isWorkday } from "@/lib/calculators/production-calendar-ru";
import { format, addDays } from "date-fns";

export type RepaymentMode = "reduce_term" | "reduce_payment";
export type RecurringFrequency = "monthly" | "quarterly" | "yearly";

export interface EarlyPaymentEntry {
  id: number;
  /** dd.MM.yyyy */
  date: string;
  amount: number;
  mode: RepaymentMode;
  /** Регулярный платёж */
  recurring?: boolean;
  /** Частота для регулярного платежа */
  frequency?: RecurringFrequency;
  /** Дата окончания регулярного платежа — dd.MM.yyyy */
  endDate?: string;
}

export interface RateChangeEntry {
  id: number;
  /** dd.MM.yyyy */
  date: string;
  ratePercent: number;
  /** Пересчитать: платёж ("payment") или срок ("term") */
  recalcMode: "payment" | "term";
}

export interface CreditHolidayEntry {
  id: number;
  /** dd.MM.yyyy — начало каникул */
  startDate: string;
  /** Количество месяцев каникул */
  months: number;
  /** "none" — нет платежей, "interest" — только проценты */
  type: "none" | "interest";
}

export interface ScheduleRow {
  n: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  early: number;
  balance: number;
  /** Годовая ставка в % на этот период */
  ratePercent: number;
  /** Тип строки: normal, holiday_none, holiday_interest */
  rowType?: "normal" | "holiday_none" | "holiday_interest";
}

export interface EarlyRepaymentResult {
  baseSchedule: ScheduleRow[];
  schedule: ScheduleRow[];
  baseMonthlyPayment: number;
  finalMonthlyPayment: number;
  baseTotalInterest: number;
  totalInterest: number;
  baseTotalPayment: number;
  totalPayment: number;
  totalEarlyPaid: number;
  baseTermMonths: number;
  actualTermMonths: number;
  interestSaved: number;
  termSavedMonths: number;
}

/* ── helpers ── */

function annuityPayment(principal: number, rMonthly: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (rMonthly <= 0) return principal / termMonths;
  const factor = Math.pow(1 + rMonthly, termMonths);
  return (principal * rMonthly * factor) / (factor - 1);
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDateDMY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  if (s.includes(".")) {
    const [dd, mm, yyyy] = s.split(".");
    return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** Сместить дату на рабочий день (если попадает на выходной/праздник) */
function shiftToWorkday(date: Date, direction: "next" | "prev"): Date {
  let d = new Date(date);
  const step = direction === "next" ? 1 : -1;
  for (let i = 0; i < 10; i++) {
    const iso = format(d, "yyyy-MM-dd");
    if (isWorkday(iso)) return d;
    d = addDays(d, step);
  }
  return d;
}

/** Округлить платёж */
function roundPaymentValue(payment: number, to: "rub" | "hundred"): number {
  if (to === "hundred") return Math.ceil(payment / 100) * 100;
  return Math.ceil(payment);
}

/** Построить базовый график (без досрочных) */
function buildBaseSchedule(
  principal: number,
  rMonthly: number,
  termMonths: number,
  issueDate: Date,
  transferWeekends: boolean,
  transferDirection: "next" | "prev",
  firstPaymentInterestOnly: boolean,
  roundPayment: boolean,
  roundTo: "rub" | "hundred",
): ScheduleRow[] {
  let mp = annuityPayment(principal, rMonthly, termMonths);
  if (roundPayment) mp = roundPaymentValue(mp, roundTo);

  const rows: ScheduleRow[] = [];
  let balance = principal;
  const annualRatePercent = rMonthly * 12 * 100;
  for (let i = 1; i <= termMonths && balance > 0.01; i++) {
    const rawDate = addMonths(issueDate, i);
    const payDate = transferWeekends ? shiftToWorkday(rawDate, transferDirection) : rawDate;
    const interest = balance * rMonthly;

    let principalPaid: number;
    let payment: number;

    if (i === 1 && firstPaymentInterestOnly) {
      principalPaid = 0;
      payment = interest;
    } else {
      principalPaid = Math.min(mp - interest, balance);
      payment = interest + principalPaid;
    }

    balance = Math.max(0, balance - principalPaid);
    rows.push({
      n: i,
      date: formatDateDMY(payDate),
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      early: 0,
      balance: Math.round(balance * 100) / 100,
      ratePercent: Math.round(annualRatePercent * 100) / 100,
      rowType: "normal",
    });
  }
  return rows;
}

export function calculateEarlyRepayment(
  loanAmount: number,
  annualRatePercent: number,
  termMonths: number,
  issueDate: Date,
  earlyPayments: EarlyPaymentEntry[],
  rateChanges: RateChangeEntry[] = [],
  creditHolidays: CreditHolidayEntry[] = [],
  firstPaymentInterestOnly = false,
  roundPayment = false,
  roundTo: "rub" | "hundred" = "rub",
  transferWeekends = false,
  transferDirection: "next" | "prev" = "next",
): EarlyRepaymentResult {
  const baseRateMonthly = annualRatePercent / 100 / 12;

  /* ── Base schedule ── */
  const baseSchedule = buildBaseSchedule(
    loanAmount,
    baseRateMonthly,
    termMonths,
    issueDate,
    transferWeekends,
    transferDirection,
    firstPaymentInterestOnly,
    roundPayment,
    roundTo,
  );
  const baseMonthlyPayment = annuityPayment(loanAmount, baseRateMonthly, termMonths);
  const baseTotalInterest = baseSchedule.reduce((s, r) => s + r.interest, 0);
  const baseTotalPayment = baseSchedule.reduce((s, r) => s + r.payment, 0);

  /* ── Expand recurring early payments into individual entries ── */
  let expandedEarlyPayments: EarlyPaymentEntry[] = [];
  let recurringIdSeq = 100_000;
  for (const ep of earlyPayments) {
    if (!ep.recurring || !ep.frequency || !ep.endDate) {
      expandedEarlyPayments.push(ep);
      continue;
    }
    const startD = parseDate(ep.date);
    const endD = parseDate(ep.endDate);
    if (!startD || !endD) { expandedEarlyPayments.push(ep); continue; }
    const stepMonths = ep.frequency === "monthly" ? 1 : ep.frequency === "quarterly" ? 3 : 12;
    let cur = new Date(startD);
    while (cur <= endD) {
      expandedEarlyPayments.push({
        id: recurringIdSeq++,
        date: formatDateDMY(cur),
        amount: ep.amount,
        mode: ep.mode,
      });
      cur = addMonths(cur, stepMonths);
    }
  }

  /* ── Prepare early payments ── */
  const sortedEarly = expandedEarlyPayments
    .filter((ep) => ep.amount > 0 && ep.date)
    .sort((a, b) => (parseDate(a.date)?.getTime() ?? 0) - (parseDate(b.date)?.getTime() ?? 0));

  /* ── Prepare rate changes ── */
  const sortedRateChanges = [...rateChanges]
    .filter((rc) => rc.ratePercent > 0 && rc.date)
    .sort((a, b) => (parseDate(a.date)?.getTime() ?? 0) - (parseDate(b.date)?.getTime() ?? 0));

  /* ── Prepare credit holidays ── */
  // Build a set of month indices (1-based) that are holiday months
  const holidayMonthMap = new Map<number, "none" | "interest">();
  for (const h of creditHolidays) {
    const startDate = parseDate(h.startDate);
    if (!startDate || h.months <= 0) continue;
    for (let offset = 0; offset < h.months; offset++) {
      const targetDate = addMonths(startDate, offset);
      // Find which monthly index this corresponds to
      // monthIndex = difference in months from issueDate
      const yearDiff = targetDate.getFullYear() - issueDate.getFullYear();
      const monthDiff = targetDate.getMonth() - issueDate.getMonth();
      const idx = yearDiff * 12 + monthDiff;
      if (idx >= 1 && idx <= termMonths * 2) {
        holidayMonthMap.set(idx, h.type);
      }
    }
  }

  /* ── Main schedule with all features ── */
  const rows: ScheduleRow[] = [];
  let balance = loanAmount;
  let rMonthly = baseRateMonthly;
  let currentPayment = annuityPayment(loanAmount, rMonthly, termMonths);
  if (roundPayment) currentPayment = roundPaymentValue(currentPayment, roundTo);
  // remainingTerm tracks how many months remain for annuity recalc
  // starts at termMonths, decrements each period, adjusted after early reduce_term payments
  let remainingTerm = termMonths;
  let monthIndex = 0;
  let totalEarlyPaid = 0;

  // Track which early payments have been applied
  const appliedEarlyIds = new Set<number>();
  // Track applied rate changes to avoid double-apply
  const appliedRateIds = new Set<number>();

  while (balance > 0.01 && monthIndex < termMonths * 3) {
    monthIndex++;
    // remainingTerm = months left BEFORE this payment (i.e., payments yet to be made including this one)
    remainingTerm = Math.max(1, remainingTerm - 1);
    const rawDate = addMonths(issueDate, monthIndex);
    const payDate = transferWeekends ? shiftToWorkday(rawDate, transferDirection) : rawDate;

    // --- Apply rate changes that fall in this month ---
    for (const rc of sortedRateChanges) {
      if (appliedRateIds.has(rc.id)) continue;
      const rcDate = parseDate(rc.date);
      if (!rcDate) continue;
      const prevDate = addMonths(issueDate, monthIndex - 1);
      if (rcDate > prevDate && rcDate <= rawDate) {
        appliedRateIds.add(rc.id);
        rMonthly = rc.ratePercent / 100 / 12;
        if (rc.recalcMode === "payment") {
          // Recalculate payment at new rate, keeping same remaining term
          // remainingTerm already decremented, so +1 to include current month
          const rem = remainingTerm + 1;
          if (rem > 0) {
            currentPayment = annuityPayment(balance, rMonthly, rem);
            if (roundPayment) currentPayment = roundPaymentValue(currentPayment, roundTo);
          }
        }
        // "term" mode: keep same payment, term will naturally shorten/extend
      }
    }

    // --- Check holiday ---
    const holidayType = holidayMonthMap.get(monthIndex);

    const interest = balance * rMonthly;
    let principalPaid: number;
    let payment: number;
    let rowType: ScheduleRow["rowType"] = "normal";

    if (holidayType === "none") {
      // Credit holiday: no payment, interest capitalizes into balance
      principalPaid = 0;
      payment = 0;
      balance = balance + interest; // interest capitalizes
      rowType = "holiday_none";
    } else if (holidayType === "interest") {
      // Credit holiday: only interest paid, no principal
      principalPaid = 0;
      payment = interest;
      rowType = "holiday_interest";
    } else if (monthIndex === 1 && firstPaymentInterestOnly) {
      // First payment interest-only
      principalPaid = 0;
      payment = interest;
    } else {
      principalPaid = Math.min(currentPayment - interest, balance);
      if (principalPaid < 0) principalPaid = 0;
      payment = interest + principalPaid;
    }

    if (holidayType !== "none") {
      balance = Math.max(0, balance - principalPaid);
    }

    // --- Apply early payments for this month ---
    let earlyThisMonth = 0;
    let modeThisMonth: RepaymentMode = "reduce_term";

    for (const ep of sortedEarly) {
      if (appliedEarlyIds.has(ep.id)) continue;
      const epDate = parseDate(ep.date);
      if (!epDate) continue;
      const prevDate = addMonths(issueDate, monthIndex - 1);
      if (epDate > prevDate && epDate <= rawDate) {
        earlyThisMonth += ep.amount;
        modeThisMonth = ep.mode;
        appliedEarlyIds.add(ep.id);
      }
    }

    const actualEarly = Math.min(earlyThisMonth, balance);
    balance = Math.max(0, balance - actualEarly);
    totalEarlyPaid += actualEarly;

    rows.push({
      n: monthIndex,
      date: formatDateDMY(payDate),
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(Math.abs(interest) * 100) / 100,
      early: Math.round(actualEarly * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      ratePercent: Math.round(rMonthly * 12 * 100 * 100) / 100,
      rowType,
    });

    if (balance < 0.01) break;

    // --- Recalculate after early payment ---
    if (actualEarly > 0) {
      if (modeThisMonth === "reduce_payment") {
        // Reduce payment: recalculate annuity on remaining term
        if (remainingTerm > 0) {
          currentPayment = annuityPayment(balance, rMonthly, remainingTerm);
          if (roundPayment) currentPayment = roundPaymentValue(currentPayment, roundTo);
        }
      } else {
        // reduce_term: keep same payment; but update remainingTerm to reflect new shorter remaining
        // Estimate new remaining term from balance and current payment
        if (rMonthly > 0 && currentPayment > balance * rMonthly) {
          const newRem = Math.ceil(
            Math.log(currentPayment / (currentPayment - balance * rMonthly)) /
            Math.log(1 + rMonthly)
          );
          remainingTerm = Math.max(1, newRem);
        } else {
          remainingTerm = Math.max(1, Math.ceil(balance / (currentPayment - balance * rMonthly + 0.01)));
        }
      }
    }

    // --- After holiday, recalculate payment on remaining balance/term ---
    if (holidayType) {
      if (remainingTerm > 0) {
        currentPayment = annuityPayment(balance, rMonthly, remainingTerm);
        if (roundPayment) currentPayment = roundPaymentValue(currentPayment, roundTo);
      }
    }
  }

  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPayment = rows.reduce((s, r) => s + r.payment, 0);
  const actualTermMonths = rows.length;
  const finalMonthlyPayment = rows.length > 0 ? rows[rows.length - 1].payment : currentPayment;

  return {
    baseSchedule,
    schedule: rows,
    baseMonthlyPayment: Math.round(
      (roundPayment ? roundPaymentValue(annuityPayment(loanAmount, baseRateMonthly, termMonths), roundTo)
        : annuityPayment(loanAmount, baseRateMonthly, termMonths)) * 100) / 100,
    finalMonthlyPayment: Math.round(finalMonthlyPayment * 100) / 100,
    baseTotalInterest: Math.round(baseTotalInterest * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    baseTotalPayment: Math.round(baseTotalPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalEarlyPaid: Math.round(totalEarlyPaid * 100) / 100,
    baseTermMonths: termMonths,
    actualTermMonths,
    interestSaved: Math.max(0, Math.round((baseTotalInterest - totalInterest) * 100) / 100),
    termSavedMonths: Math.max(0, termMonths - actualTermMonths),
  };
}
