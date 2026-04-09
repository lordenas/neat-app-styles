/**
 * Калькулятор процентов по договору займа (ст. 191, п. 3 ст. 809 ГК РФ).
 * Порт из neat-app-styles/src/lib/calculators/loan-interest.ts
 */

import type {
  DebtIncrease,
  LoanInterestInput,
  LoanInterestResult,
  LoanInterestRow,
  Payout,
} from './loan-interest.types';
import {
  addDays,
  differenceInCalendarDays,
  formatDate,
  isAfter,
  isBefore,
  parseISODate,
} from './loan-interest.date';

const DAYS_PER_YEAR = 365;

function toDate(str: string): Date {
  return parseISODate(str);
}

function toDateStr(d: Date): string {
  return formatDate(d);
}

function buildFormulaText(
  principal: number,
  days: number,
  ratePercent: number,
): string {
  const s = principal.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${s} × ${days} / ${DAYS_PER_YEAR} × ${ratePercent}%`;
}

function periodInterest(
  principal: number,
  days: number,
  ratePercent: number,
): number {
  if (principal <= 0 || days <= 0) return 0;
  return (
    Math.round(principal * (days / DAYS_PER_YEAR) * (ratePercent / 100) * 100) /
    100
  );
}

export function calcLoanInterest(input: LoanInterestInput): LoanInterestResult {
  const accStart = addDays(toDate(input.startDate), 1);
  const accEnd = toDate(input.endDate);
  if (
    !isBefore(accStart, accEnd) &&
    toDateStr(accStart) !== toDateStr(accEnd)
  ) {
    return {
      totalInterest: 0,
      totalDebtAndInterest: input.principal,
      totalDays: 0,
      rows: [],
    };
  }

  const totalDays = differenceInCalendarDays(accEnd, accStart) + 1;

  const rateChangeDates = input.rateChanges
    .map((r) => r.date)
    .filter((d) => {
      const dt = toDate(d);
      return !isBefore(dt, accStart) && !isAfter(dt, accEnd);
    });

  const segmentStartsSet = new Set<string>();
  segmentStartsSet.add(toDateStr(accStart));
  for (const d of rateChangeDates) segmentStartsSet.add(d);
  for (const p of input.payouts) {
    const next = addDays(toDate(p.date), 1);
    if (!isAfter(next, accEnd)) segmentStartsSet.add(toDateStr(next));
  }
  for (const a of input.debtIncreases) {
    const next = addDays(toDate(a.date), 1);
    if (!isAfter(next, accEnd)) segmentStartsSet.add(toDateStr(next));
  }
  const segmentStarts = Array.from(segmentStartsSet)
    .map((s) => toDate(s))
    .filter((d) => !isAfter(d, accEnd))
    .sort((a, b) => a.getTime() - b.getTime());

  const rows: LoanInterestRow[] = [];
  let principal = input.principal;
  let cumulativeInterest = 0;

  const getRateOnDate = (dateStr: string): number => {
    const sorted = [...input.rateChanges].sort(
      (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime(),
    );
    let rate = input.initialRatePercent;
    for (const r of sorted) {
      if (r.date <= dateStr) rate = r.ratePercent;
      else break;
    }
    return rate;
  };

  const rateChangesByDate = new Map<string, number>();
  for (const r of input.rateChanges)
    rateChangesByDate.set(r.date, r.ratePercent);
  const payoutsByDate = new Map<string, Payout[]>();
  for (const p of input.payouts) {
    const list = payoutsByDate.get(p.date) ?? [];
    list.push(p);
    payoutsByDate.set(p.date, list);
  }
  const addsByDate = new Map<string, DebtIncrease[]>();
  for (const a of input.debtIncreases) {
    const list = addsByDate.get(a.date) ?? [];
    list.push(a);
    addsByDate.set(a.date, list);
  }

  let periodIndex = 0;
  for (let i = 0; i < segmentStarts.length; i++) {
    const segStart = segmentStarts[i];
    const segEnd =
      i + 1 < segmentStarts.length ? addDays(segmentStarts[i + 1], -1) : accEnd;
    if (isAfter(segStart, segEnd)) continue;

    const currentRate = getRateOnDate(toDateStr(segStart));
    const days = differenceInCalendarDays(segEnd, segStart) + 1;
    const periodInt = periodInterest(principal, days, currentRate);
    cumulativeInterest =
      Math.round((cumulativeInterest + periodInt) * 100) / 100;

    periodIndex += 1;
    rows.push({
      type: 'period',
      periodIndex,
      dateFrom: toDateStr(segStart),
      dateTo: toDateStr(segEnd),
      principal,
      days,
      ratePercent: currentRate,
      formulaText: buildFormulaText(principal, days, currentRate),
      periodInterest: periodInt,
      cumulativeInterest,
    });

    const segEndStr = toDateStr(segEnd);
    const newRate = rateChangesByDate.get(segEndStr);
    if (newRate !== undefined) {
      rows.push({ type: 'rate_change', ratePercent: newRate });
    }

    const addsOnDate = addsByDate.get(segEndStr) ?? [];
    for (const a of addsOnDate) {
      principal = Math.round((principal + a.amount) * 100) / 100;
      rows.push({
        type: 'debt_increase',
        amount: a.amount,
        comment: a.comment,
      });
    }

    const payoutsOnDate = payoutsByDate.get(segEndStr) ?? [];
    for (const p of payoutsOnDate) {
      let toInterest = 0;
      let toPrincipal = 0;
      if (input.payoutAppliesToInterestFirst !== false) {
        toInterest = Math.min(p.amount, cumulativeInterest);
        toPrincipal = Math.max(0, p.amount - toInterest);
      } else {
        toPrincipal = Math.min(p.amount, principal);
        toInterest = Math.max(0, p.amount - toPrincipal);
      }
      cumulativeInterest =
        Math.round((cumulativeInterest - toInterest) * 100) / 100;
      principal = Math.max(
        0,
        Math.round((principal - toPrincipal) * 100) / 100,
      );
      rows.push({
        type: 'payout',
        amount: p.amount,
        comment: p.comment,
        cumulativeInterestAfter: cumulativeInterest,
      });
    }
  }

  const totalDebtAndInterest =
    Math.round((principal + cumulativeInterest) * 100) / 100;

  return {
    totalInterest: cumulativeInterest,
    totalDebtAndInterest,
    totalDays,
    rows,
  };
}
