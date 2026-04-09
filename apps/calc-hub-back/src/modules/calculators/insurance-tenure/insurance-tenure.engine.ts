/**
 * Калькулятор страхового стажа (ст. 7 № 255-ФЗ).
 * Порт из neat-app-styles/src/lib/calculators/insurance-tenure.ts
 */

import type {
  InsuranceTenureResult,
  TenurePeriod,
} from './insurance-tenure.types';

function daysBetween(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  if (Number.isNaN(e.getTime()) || Number.isNaN(s.getTime()) || e < s) return 0;
  return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
}

export function calcInsuranceTenure(
  periods: TenurePeriod[],
): InsuranceTenureResult {
  let totalRawDays = 0;
  for (const p of periods) {
    if (p.startDate && p.endDate) {
      totalRawDays += daysBetween(p.startDate, p.endDate);
    }
  }

  const totalYears = Math.floor(totalRawDays / 365);
  const remainderAfterYears = totalRawDays % 365;
  const totalMonths = Math.floor(remainderAfterYears / 30);
  const totalDays = remainderAfterYears % 30;

  let sickPayPercent: 60 | 80 | 100;
  let sickPayDescription: string;

  if (totalRawDays >= 8 * 365) {
    sickPayPercent = 100;
    sickPayDescription = 'Стаж 8+ лет — 100% среднего заработка';
  } else if (totalRawDays >= 5 * 365) {
    sickPayPercent = 80;
    sickPayDescription = 'Стаж 5–8 лет — 80% среднего заработка';
  } else {
    sickPayPercent = 60;
    sickPayDescription = 'Стаж менее 5 лет — 60% среднего заработка';
  }

  return {
    totalYears,
    totalMonths,
    totalDays,
    rawDays: totalRawDays,
    sickPayPercent,
    sickPayDescription,
  };
}
