/**
 * Калькулятор микрозаймов — типы входа/выхода.
 */

export type RateUnit = 'day' | 'month';
export type OverduePeriodUnit = 'days' | 'months';

export interface MicroloanInput {
  amount: number;
  termDays: number;
  rate: number;
  rateUnit: RateUnit;
  hasOverdue: boolean;
  overduePeriod: number;
  overdueUnit: OverduePeriodUnit;
  overdueRate: number;
  overdueRateUnit: RateUnit;
  penaltyAmount: number;
}

export interface DailyAccrualRow {
  day: number;
  interest: number;
  total: number;
}

export interface MicroloanResult {
  interestAccrued: number;
  totalToRepay: number;
  overdueInterest: number;
  overdueTotal: number;
  grandTotal: number;
  dailyAccrual: DailyAccrualRow[];
}
