import { getKeyRateData } from './peni.key-rate';
import type {
  KeyRateEntry,
  PeniBreakdownRow,
  PeniInput,
  PeniResult,
  PeniCalculationType,
  TaxPayerType,
} from './peni.types';

const PENI_FRACTION_1_300 = 1 / 300;
const PENI_FRACTION_1_150 = 1 / 150;
const PENI_FRACTION_1_130 = 1 / 130;

export function getKeyRateOnDate(rates: KeyRateEntry[], date: string): number {
  let rate = rates[0]?.value ?? 21;
  for (const entry of rates) {
    if (entry.date <= date) {
      rate = entry.value;
    } else {
      break;
    }
  }
  return rate;
}

export function daysBetween(from: string, to: string): number {
  const d1 = new Date(from);
  const d2 = new Date(to);
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000));
}

export function calculateDailyPeni(
  debt: number,
  keyRate: number,
  fraction: number,
): number {
  return debt * (keyRate / 100) * fraction;
}

export function getPeniFraction(
  type: PeniCalculationType,
  payerType: TaxPayerType,
  daysOverdue: number,
): number {
  switch (type) {
    case 'tax':
      if (payerType === 'individual') return PENI_FRACTION_1_300;
      return daysOverdue <= 30 ? PENI_FRACTION_1_300 : PENI_FRACTION_1_150;
    case 'utilities':
      if (daysOverdue <= 30) return 0;
      if (daysOverdue <= 90) return PENI_FRACTION_1_300;
      return PENI_FRACTION_1_130;
    case 'salary':
      return PENI_FRACTION_1_150;
    default:
      return PENI_FRACTION_1_300;
  }
}

export function calcPeni(input: PeniInput): PeniResult | null {
  const { debt, calcType, payerType, dateFrom, dateTo } = input;
  if (debt <= 0 || !dateFrom || !dateTo || dateFrom >= dateTo) return null;

  const rates = getKeyRateData();
  const totalDays = daysBetween(dateFrom, dateTo);
  let totalPeni = 0;
  const breakdown: PeniBreakdownRow[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(dateFrom);
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().slice(0, 10);
    const keyRate = getKeyRateOnDate(rates, dateStr);
    const fraction = getPeniFraction(calcType, payerType, i + 1);
    const daily = calculateDailyPeni(debt, keyRate, fraction);
    totalPeni += daily;

    const last = breakdown[breakdown.length - 1];
    if (!last || last.keyRate !== keyRate || last.fraction !== fraction) {
      breakdown.push({
        dateFrom: dateStr,
        dateTo: dateStr,
        keyRate,
        fraction,
        dailyPeni: daily,
        days: 1,
      });
    } else {
      last.dateTo = dateStr;
      last.days++;
    }
  }

  return {
    totalDays,
    totalPeni: Math.round(totalPeni * 100) / 100,
    breakdown,
  };
}
