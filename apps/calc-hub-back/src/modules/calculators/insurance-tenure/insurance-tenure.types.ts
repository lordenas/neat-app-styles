/**
 * Калькулятор страхового стажа — типы входа/выхода.
 */

export interface TenurePeriod {
  startDate: string;
  endDate: string;
}

export interface InsuranceTenureResult {
  totalYears: number;
  totalMonths: number;
  totalDays: number;
  rawDays: number;
  sickPayPercent: 60 | 80 | 100;
  sickPayDescription: string;
}
