/**
 * Калькулятор микрозаймов: начисление процентов, просрочка, штрафы.
 * Порт из neat-app-styles/src/lib/calculators/microloan.ts
 */

import type {
  DailyAccrualRow,
  MicroloanInput,
  MicroloanResult,
  OverduePeriodUnit,
  RateUnit,
} from './microloan.types';

function toDailyRate(ratePercent: number, unit: RateUnit): number {
  if (unit === 'day') return ratePercent / 100;
  return ratePercent / 100 / 30;
}

function overduePeriodToDays(value: number, unit: OverduePeriodUnit): number {
  if (unit === 'days') return value;
  return value * 30;
}

export function calculateMicroloan(input: MicroloanInput): MicroloanResult {
  const {
    amount,
    termDays,
    rate,
    rateUnit,
    hasOverdue,
    overduePeriod,
    overdueUnit,
    overdueRate,
    overdueRateUnit,
    penaltyAmount,
  } = input;

  const dailyRate = toDailyRate(rate, rateUnit);
  const interestAccrued = amount * dailyRate * termDays;
  const totalToRepay = amount + interestAccrued;

  const dailyAccrual: DailyAccrualRow[] = [];
  for (let d = 1; d <= termDays; d++) {
    const dayInterest = amount * dailyRate * d;
    dailyAccrual.push({
      day: d,
      interest: Math.round(dayInterest * 100) / 100,
      total: Math.round((amount + dayInterest) * 100) / 100,
    });
  }

  let overdueInterest = 0;
  let overdueTotal = 0;
  let grandTotal = totalToRepay;

  if (hasOverdue && (overduePeriod > 0 || penaltyAmount > 0)) {
    const overdueDaysTotal = overduePeriodToDays(overduePeriod, overdueUnit);
    const overdueDailyRate = toDailyRate(overdueRate, overdueRateUnit);
    overdueInterest = amount * overdueDailyRate * overdueDaysTotal;
    overdueTotal = overdueInterest + penaltyAmount;
    grandTotal = totalToRepay + overdueTotal;
  }

  return {
    interestAccrued: Math.round(interestAccrued * 100) / 100,
    totalToRepay: Math.round(totalToRepay * 100) / 100,
    overdueInterest: Math.round(overdueInterest * 100) / 100,
    overdueTotal: Math.round(overdueTotal * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    dailyAccrual,
  };
}
