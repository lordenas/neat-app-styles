/**
 * Движок расчёта аннуитетных кредитов с досрочными погашениями,
 * изменениями ставки и кредитными каникулами.
 */

import { isWorkday } from './workday.helper';
import type {
  CreditHolidayEntry,
  EarlyPaymentEntry,
  EarlyRepaymentResult,
  RateChangeEntry,
  RepaymentMode,
  ScheduleRow,
} from './early-repayment.types';

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateDMY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function dateToIso(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  if (s.includes('.')) {
    const parts = s.split('.');
    if (parts.length !== 3) return null;
    const dd = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10) - 1;
    const yyyy = parseInt(parts[2], 10);
    const d = new Date(yyyy, mm, dd);
    if (isNaN(d.getTime())) return null;
    return d;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function shiftToWorkday(date: Date, direction: 'next' | 'prev'): Date {
  let d = new Date(date);
  const step = direction === 'next' ? 1 : -1;
  for (let i = 0; i < 10; i++) {
    const iso = dateToIso(d);
    if (isWorkday(iso)) return d;
    d = addDays(d, step);
  }
  return d;
}

function roundPaymentValue(payment: number, to: 'rub' | 'hundred'): number {
  if (to === 'hundred') return Math.ceil(payment / 100) * 100;
  return Math.ceil(payment);
}

function annuityPayment(
  principal: number,
  rMonthly: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (rMonthly <= 0) return principal / termMonths;
  const factor = Math.pow(1 + rMonthly, termMonths);
  return (principal * rMonthly * factor) / (factor - 1);
}

function buildBaseSchedule(
  principal: number,
  rMonthly: number,
  termMonths: number,
  issueDate: Date,
  transferWeekends: boolean,
  transferDirection: 'next' | 'prev',
  firstPaymentInterestOnly: boolean,
  roundPayment: boolean,
  roundTo: 'rub' | 'hundred',
): ScheduleRow[] {
  let mp = annuityPayment(principal, rMonthly, termMonths);
  if (roundPayment) mp = roundPaymentValue(mp, roundTo);

  const rows: ScheduleRow[] = [];
  let balance = principal;
  const annualRatePercent = rMonthly * 12 * 100;
  for (let i = 1; i <= termMonths && balance > 0.01; i++) {
    const rawDate = addMonths(issueDate, i);
    const payDate = transferWeekends
      ? shiftToWorkday(rawDate, transferDirection)
      : rawDate;
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
      rowType: 'normal',
    });
  }
  return rows;
}

function ensureId<T extends { id?: number }>(
  entry: T,
  id: number,
): T & { id: number } {
  return { ...entry, id: entry.id ?? id };
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
  roundTo: 'rub' | 'hundred' = 'rub',
  transferWeekends = false,
  transferDirection: 'next' | 'prev' = 'next',
): EarlyRepaymentResult {
  const baseRateMonthly = annualRatePercent / 100 / 12;

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
  const baseTotalInterest = baseSchedule.reduce((s, r) => s + r.interest, 0);
  const baseTotalPayment = baseSchedule.reduce((s, r) => s + r.payment, 0);

  const expandedEarlyPayments: (EarlyPaymentEntry & { id: number })[] = [];
  let recurringIdSeq = 100_000;
  const withIds = earlyPayments.map((ep, idx) => ensureId(ep, idx + 1));
  for (const ep of withIds) {
    if (!ep.recurring || !ep.frequency || !ep.endDate) {
      expandedEarlyPayments.push(ep);
      continue;
    }
    const startD = parseDate(ep.date);
    const endD = parseDate(ep.endDate);
    if (!startD || !endD) {
      expandedEarlyPayments.push(ep);
      continue;
    }
    const stepMonths =
      ep.frequency === 'monthly' ? 1 : ep.frequency === 'quarterly' ? 3 : 12;
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

  const sortedEarly = expandedEarlyPayments
    .filter((ep) => ep.amount > 0 && ep.date)
    .sort(
      (a, b) =>
        (parseDate(a.date)?.getTime() ?? 0) -
        (parseDate(b.date)?.getTime() ?? 0),
    );

  const rateChangesWithIds = rateChanges.map((rc, idx) =>
    ensureId(rc, idx + 1),
  );
  const sortedRateChanges = [...rateChangesWithIds]
    .filter((rc) => rc.ratePercent > 0 && rc.date)
    .sort(
      (a, b) =>
        (parseDate(a.date)?.getTime() ?? 0) -
        (parseDate(b.date)?.getTime() ?? 0),
    );

  const holidayMonthMap = new Map<number, 'none' | 'interest'>();
  for (const h of creditHolidays) {
    const startDate = parseDate(h.startDate);
    if (!startDate || h.months <= 0) continue;
    for (let offset = 0; offset < h.months; offset++) {
      const targetDate = addMonths(startDate, offset);
      const yearDiff = targetDate.getFullYear() - issueDate.getFullYear();
      const monthDiff = targetDate.getMonth() - issueDate.getMonth();
      const idx = yearDiff * 12 + monthDiff;
      if (idx >= 1 && idx <= termMonths * 2) {
        holidayMonthMap.set(idx, h.type);
      }
    }
  }

  const rows: ScheduleRow[] = [];
  let balance = loanAmount;
  let rMonthly = baseRateMonthly;
  let currentPayment = annuityPayment(loanAmount, rMonthly, termMonths);
  if (roundPayment) currentPayment = roundPaymentValue(currentPayment, roundTo);
  let remainingTerm = termMonths;
  let monthIndex = 0;
  let totalEarlyPaid = 0;
  const appliedEarlyIds = new Set<number>();
  const appliedRateIds = new Set<number>();

  while (balance > 0.01 && monthIndex < termMonths * 3) {
    monthIndex++;
    remainingTerm = Math.max(1, remainingTerm - 1);
    const rawDate = addMonths(issueDate, monthIndex);
    const payDate = transferWeekends
      ? shiftToWorkday(rawDate, transferDirection)
      : rawDate;

    for (const rc of sortedRateChanges) {
      if (appliedRateIds.has(rc.id)) continue;
      const rcDate = parseDate(rc.date);
      if (!rcDate) continue;
      const prevDate = addMonths(issueDate, monthIndex - 1);
      if (rcDate > prevDate && rcDate <= rawDate) {
        appliedRateIds.add(rc.id);
        rMonthly = rc.ratePercent / 100 / 12;
        if (rc.recalcMode === 'payment') {
          const rem = remainingTerm + 1;
          if (rem > 0) {
            currentPayment = annuityPayment(balance, rMonthly, rem);
            if (roundPayment)
              currentPayment = roundPaymentValue(currentPayment, roundTo);
          }
        }
      }
    }

    const holidayType = holidayMonthMap.get(monthIndex);
    const interest = balance * rMonthly;
    let principalPaid: number;
    let payment: number;
    let rowType: ScheduleRow['rowType'] = 'normal';

    if (holidayType === 'none') {
      principalPaid = 0;
      payment = 0;
      balance = balance + interest;
      rowType = 'holiday_none';
    } else if (holidayType === 'interest') {
      principalPaid = 0;
      payment = interest;
      rowType = 'holiday_interest';
    } else if (monthIndex === 1 && firstPaymentInterestOnly) {
      principalPaid = 0;
      payment = interest;
    } else {
      principalPaid = Math.min(currentPayment - interest, balance);
      if (principalPaid < 0) principalPaid = 0;
      payment = interest + principalPaid;
    }

    if (holidayType !== 'none') {
      balance = Math.max(0, balance - principalPaid);
    }

    let earlyThisMonth = 0;
    let modeThisMonth: RepaymentMode = 'reduce_term';
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

    if (actualEarly > 0) {
      if (modeThisMonth === 'reduce_payment') {
        if (remainingTerm > 0) {
          currentPayment = annuityPayment(balance, rMonthly, remainingTerm);
          if (roundPayment)
            currentPayment = roundPaymentValue(currentPayment, roundTo);
        }
      } else {
        if (rMonthly > 0 && currentPayment > balance * rMonthly) {
          const newRem = Math.ceil(
            Math.log(currentPayment / (currentPayment - balance * rMonthly)) /
              Math.log(1 + rMonthly),
          );
          remainingTerm = Math.max(1, newRem);
        } else {
          remainingTerm = Math.max(
            1,
            Math.ceil(balance / (currentPayment - balance * rMonthly + 0.01)),
          );
        }
      }
    }

    if (holidayType) {
      if (remainingTerm > 0) {
        currentPayment = annuityPayment(balance, rMonthly, remainingTerm);
        if (roundPayment)
          currentPayment = roundPaymentValue(currentPayment, roundTo);
      }
    }
  }

  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPayment = rows.reduce((s, r) => s + r.payment, 0);
  const actualTermMonths = rows.length;
  const finalMonthlyPayment =
    rows.length > 0 ? rows[rows.length - 1].payment : currentPayment;

  return {
    baseSchedule,
    schedule: rows,
    baseMonthlyPayment: (() => {
      const raw = annuityPayment(loanAmount, baseRateMonthly, termMonths);
      const value = roundPayment ? roundPaymentValue(raw, roundTo) : raw;
      return Math.round(value * 100) / 100;
    })(),
    finalMonthlyPayment: Math.round(finalMonthlyPayment * 100) / 100,
    baseTotalInterest: Math.round(baseTotalInterest * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    baseTotalPayment: Math.round(baseTotalPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalEarlyPaid: Math.round(totalEarlyPaid * 100) / 100,
    baseTermMonths: termMonths,
    actualTermMonths,
    interestSaved: Math.max(
      0,
      Math.round((baseTotalInterest - totalInterest) * 100) / 100,
    ),
    termSavedMonths: Math.max(0, termMonths - actualTermMonths),
  };
}
