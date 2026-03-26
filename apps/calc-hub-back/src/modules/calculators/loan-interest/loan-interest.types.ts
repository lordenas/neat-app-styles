/**
 * Калькулятор процентов по займу (ст. 809 ГК РФ) — типы.
 */

export interface RateChange {
  date: string;
  ratePercent: number;
}

export interface Payout {
  date: string;
  amount: number;
  comment?: string;
}

export interface DebtIncrease {
  date: string;
  amount: number;
  comment?: string;
}

export interface LoanInterestInput {
  principal: number;
  startDate: string;
  endDate: string;
  initialRatePercent: number;
  rateChanges: RateChange[];
  payouts: Payout[];
  debtIncreases: DebtIncrease[];
  payoutAppliesToInterestFirst?: boolean;
}

export type LoanInterestRow =
  | {
      type: 'period';
      periodIndex: number;
      dateFrom: string;
      dateTo: string;
      principal: number;
      days: number;
      ratePercent: number;
      formulaText: string;
      periodInterest: number;
      cumulativeInterest: number;
    }
  | { type: 'rate_change'; ratePercent: number }
  | {
      type: 'payout';
      amount: number;
      comment?: string;
      cumulativeInterestAfter: number;
    }
  | { type: 'debt_increase'; amount: number; comment?: string };

export interface LoanInterestResult {
  totalInterest: number;
  totalDebtAndInterest: number;
  totalDays: number;
  rows: LoanInterestRow[];
}
