/**
 * Расчёт процентов по статье 395 ГК РФ (проценты за пользование чужими денежными средствами).
 */

import type { KeyRateEntry } from "@/lib/calculators/peni";
import {
  addDays,
  differenceInCalendarDays,
  isBefore,
  parseISO,
  format,
} from "date-fns";
import { ru } from "date-fns/locale";

export type ExcludedPeriod = {
  from: string;
  to: string;
  comment?: string;
};

export type PartialPayment = {
  date: string;
  amount: number;
  comment?: string;
};

export type DebtIncrease = {
  date: string;
  amount: number;
  comment?: string;
};

export type Gk395Input = {
  sum: number;
  startDate: string;
  endDate: string;
  excludedPeriods: ExcludedPeriod[];
  partialPayments: PartialPayment[];
  debtIncreases: DebtIncrease[];
};

export type Gk395BreakdownRow = {
  amountLabel: string;
  periodLabel: string;
  comment?: string;
  days: number;
  ratePercent: number;
  formula: string;
  interest: number;
  isExcluded?: boolean;
  isPayment?: boolean;
  isDebtIncrease?: boolean;
};

export type Gk395Result = {
  totalInterest: number;
  totalDebtWithInterest: number;
  breakdown: Gk395BreakdownRow[];
};

function getRateOnDate(rates: KeyRateEntry[], dateStr: string): number {
  if (!rates.length) return 0;
  const d = parseISO(dateStr);
  let value = rates[0].value;
  for (const r of rates) {
    const rDate = parseISO(r.date);
    if (isBefore(d, rDate) && r.date !== dateStr) break;
    value = r.value;
  }
  return value > 50 ? value / 10 : value;
}

function getDaysInYearForSegment(d1: string, d2: string): number {
  const segStart = parseISO(d1);
  const segEnd = addDays(parseISO(d2), -1);
  const y2024Start = parseISO("2024-01-01");
  const y2024End = parseISO("2024-12-31");
  const clampStart = isBefore(segStart, y2024Start) ? y2024Start : segStart;
  const clampEnd = isBefore(segEnd, y2024End) ? segEnd : y2024End;
  const daysIn2024 =
    !isBefore(clampEnd, y2024Start) && !isBefore(y2024End, clampStart)
      ? differenceInCalendarDays(addDays(clampEnd, 1), clampStart)
      : 0;
  const totalDays = differenceInCalendarDays(parseISO(d2), parseISO(d1));
  return daysIn2024 > totalDays / 2 ? 366 : 365;
}

function isSegmentExcluded(
  d1: string,
  d2: string,
  excluded: ExcludedPeriod[]
): boolean {
  const lastDay = addDays(parseISO(d2), -1);
  for (const ex of excluded) {
    const exFrom = parseISO(ex.from);
    const exTo = parseISO(ex.to);
    const segStart = parseISO(d1);
    if (!isBefore(segStart, exFrom) && !isBefore(exTo, lastDay)) return true;
  }
  return false;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function calcGk395(
  input: Gk395Input,
  keyRates: KeyRateEntry[]
): Gk395Result | null {
  const {
    sum,
    startDate,
    endDate,
    excludedPeriods,
    partialPayments,
    debtIncreases,
  } = input;

  if (sum <= 0 || !keyRates.length) return null;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (!isBefore(start, end) && startDate !== endDate) return null;

  const boundarySet = new Set<string>();
  boundarySet.add(startDate);
  excludedPeriods.forEach((ex) => {
    boundarySet.add(ex.from);
    boundarySet.add(ex.to);
    try {
      boundarySet.add(format(addDays(parseISO(ex.to), 1), "yyyy-MM-dd"));
    } catch {
      // ignore
    }
  });
  partialPayments.forEach((p) => boundarySet.add(p.date));
  debtIncreases.forEach((a) => boundarySet.add(a.date));
  keyRates.forEach((r) => boundarySet.add(r.date));

  const endNext = format(addDays(parseISO(endDate), 1), "yyyy-MM-dd");
  boundarySet.add(endNext);

  const boundaries = Array.from(boundarySet).filter((d) => {
    const parsed = parseISO(d);
    return !isBefore(parsed, start) && !isBefore(addDays(parseISO(endDate), 1), parsed);
  });
  boundaries.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const eventsByDate = new Map<string, { add: number; pay: number }>();
  debtIncreases.forEach((a) => {
    if (!eventsByDate.has(a.date)) eventsByDate.set(a.date, { add: 0, pay: 0 });
    const e = eventsByDate.get(a.date)!;
    e.add += a.amount;
  });
  partialPayments.forEach((p) => {
    if (!eventsByDate.has(p.date)) eventsByDate.set(p.date, { add: 0, pay: 0 });
    const e = eventsByDate.get(p.date)!;
    e.pay += p.amount;
  });

  let balance = sum;
  const segments: { d1: string; d2: string; balance: number }[] = [];
  for (let i = 0; i < boundaries.length; i++) {
    const d1 = boundaries[i];
    const d2 =
      i + 1 < boundaries.length
        ? boundaries[i + 1]
        : format(addDays(parseISO(endDate), 1), "yyyy-MM-dd");
    const d1Parsed = parseISO(d1);
    const d2Parsed = parseISO(d2);
    if (!isBefore(d1Parsed, d2Parsed)) continue;

    segments.push({ d1, d2, balance });

    const ev = eventsByDate.get(d1);
    if (ev) balance = balance + ev.add - ev.pay;
  }

  let totalInterest = 0;
  const breakdown: Gk395BreakdownRow[] = [];
  const endNextVal = format(addDays(parseISO(endDate), 1), "yyyy-MM-dd");

  for (const seg of segments) {
    const days = differenceInCalendarDays(parseISO(seg.d2), parseISO(seg.d1));
    if (days <= 0) continue;

    const excluded = isSegmentExcluded(seg.d1, seg.d2, excludedPeriods);
    const rate = getRateOnDate(keyRates, seg.d1);
    const daysInYear = getDaysInYearForSegment(seg.d1, seg.d2);
    const interestRaw = excluded ? 0 : seg.balance * (days / daysInYear) * (rate / 100);
    const interestDisplay = excluded ? 0 : Math.round(interestRaw * 100) / 100;
    if (!excluded) totalInterest += interestDisplay;

    const periodLabel = `${format(parseISO(seg.d1), "dd.MM.yyyy", { locale: ru })} – ${format(addDays(parseISO(seg.d2), -1), "dd.MM.yyyy", { locale: ru })}`;
    const formula = excluded
      ? ""
      : `${formatNumber(seg.balance)} × ${days} / ${daysInYear} × ${rate}%`;
    breakdown.push({
      amountLabel: formatNumber(seg.balance) + " ₽",
      periodLabel,
      days,
      ratePercent: rate,
      formula,
      interest: interestDisplay,
      isExcluded: excluded,
    });

    const eventDate = seg.d2 === endNextVal ? endDate : seg.d2;
    if (seg.d2 === endNextVal && eventDate !== endDate) continue;
    const addOnD2 = debtIncreases.filter((a) => a.date === eventDate);
    const payOnD2 = partialPayments.filter((p) => p.date === eventDate && p.amount > 0);
    for (const a of addOnD2) {
      breakdown.push({
        amountLabel: "+" + formatNumber(a.amount) + " ₽",
        periodLabel: format(parseISO(a.date), "dd.MM.yyyy", { locale: ru }) + " (увеличение долга)",
        comment: a.comment?.trim() || undefined,
        days: 0,
        ratePercent: 0,
        formula: "",
        interest: 0,
        isDebtIncrease: true,
      });
    }
    for (const p of payOnD2) {
      breakdown.push({
        amountLabel: "−" + formatNumber(p.amount) + " ₽",
        periodLabel: format(parseISO(p.date), "dd.MM.yyyy", { locale: ru }) + " (оплата задолженности)",
        comment: p.comment?.trim() || undefined,
        days: 0,
        ratePercent: 0,
        formula: "",
        interest: 0,
        isPayment: true,
      });
    }
  }

  const totalInterestRounded = Math.round(totalInterest * 100) / 100;
  const finalBalance =
    sum +
    debtIncreases.reduce((acc, a) => acc + a.amount, 0) -
    partialPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalDebtWithInterest = finalBalance + totalInterestRounded;

  return {
    totalInterest: totalInterestRounded,
    totalDebtWithInterest,
    breakdown,
  };
}
