/**
 * Калькулятор страхового стажа.
 *
 * Стаж = сумма всех периодов работы.
 * Результат: лет, месяцев, дней + процент оплаты больничного (60/80/100%).
 */

export type TenurePeriod = {
  /** Дата начала (yyyy-mm-dd) */
  startDate: string;
  /** Дата окончания (yyyy-mm-dd) */
  endDate: string;
};

export type InsuranceTenureResult = {
  totalYears: number;
  totalMonths: number;
  totalDays: number;
  /** Общее количество дней */
  rawDays: number;
  /** Процент оплаты больничного */
  sickPayPercent: 60 | 80 | 100;
  /** Описание */
  sickPayDescription: string;
};

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  // Включительно: +1 день
  return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
}

export function calcInsuranceTenure(periods: TenurePeriod[]): InsuranceTenureResult {
  let totalRawDays = 0;

  for (const p of periods) {
    totalRawDays += daysBetween(p.startDate, p.endDate);
  }

  const totalYears = Math.floor(totalRawDays / 365);
  const remainderAfterYears = totalRawDays % 365;
  const totalMonths = Math.floor(remainderAfterYears / 30);
  const totalDays = remainderAfterYears % 30;

  let sickPayPercent: 60 | 80 | 100;
  let sickPayDescription: string;

  if (totalRawDays >= 8 * 365) {
    sickPayPercent = 100;
    sickPayDescription = "Стаж 8+ лет — 100% среднего заработка";
  } else if (totalRawDays >= 5 * 365) {
    sickPayPercent = 80;
    sickPayDescription = "Стаж 5–8 лет — 80% среднего заработка";
  } else {
    sickPayPercent = 60;
    sickPayDescription = "Стаж менее 5 лет — 60% среднего заработка";
  }

  return { totalYears, totalMonths, totalDays, rawDays: totalRawDays, sickPayPercent, sickPayDescription };
}
