/**
 * Типы для калькулятора досрочного погашения кредита.
 */

export type RepaymentMode = 'reduce_term' | 'reduce_payment';
export type RecurringFrequency = 'monthly' | 'quarterly' | 'yearly';

export interface EarlyPaymentEntry {
  id?: number;
  /** dd.MM.yyyy */
  date: string;
  amount: number;
  mode: RepaymentMode;
  recurring?: boolean;
  frequency?: RecurringFrequency;
  endDate?: string;
}

export interface RateChangeEntry {
  id?: number;
  date: string;
  ratePercent: number;
  recalcMode: 'payment' | 'term';
}

export interface CreditHolidayEntry {
  id?: number;
  startDate: string;
  months: number;
  type: 'none' | 'interest';
}

export interface ScheduleRow {
  n: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  early: number;
  balance: number;
  ratePercent: number;
  rowType?: 'normal' | 'holiday_none' | 'holiday_interest';
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
