/**
 * Калькулятор вклада — типы входа/выхода.
 */

export type TermUnit = 'days' | 'months' | 'years';

export type CompoundFrequency = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export type PayoutFrequency = 'end' | '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export interface OneTimeTopUp {
  date: string;
  amount: number;
}

export interface RegularTopUp {
  startDate: string;
  endDate?: string;
  period: '1M' | '2M' | '3M' | '6M' | '1Y';
  amount: number;
}

export interface OneTimeWithdrawal {
  date: string;
  amount: number;
}

export interface RegularWithdrawal {
  startDate: string;
  endDate?: string;
  period: '1M' | '2M' | '3M' | '6M' | '1Y';
  amount: number;
}

export interface DepositInput {
  principal: number;
  startDate: string;
  term: number;
  termUnit: TermUnit;
  annualRatePercent: number;
  capitalization: boolean;
  compoundFrequency: CompoundFrequency;
  payoutFrequency: PayoutFrequency;
  oneTimeTopUps: OneTimeTopUp[];
  regularTopUps: RegularTopUp[];
  oneTimeWithdrawals: OneTimeWithdrawal[];
  regularWithdrawals: RegularWithdrawal[];
  minimumBalance: number;
  keyRatePercent?: number;
  keyRatesByYear?: Record<number, number>;
  taxRatePercent?: number;
}

export interface DepositScheduleRow {
  date: string;
  eventType: string;
  label: string;
  amountDelta: number;
  interestAccrued: number;
  balance: number;
}

export interface DepositTaxRow {
  year: number;
  income: number;
  deduction: number;
  taxableIncome: number;
  taxAmount: number;
  payByDate: string;
}

export interface DepositResult {
  totalInterest: number;
  finalBalance: number;
  totalReturn: number;
  totalTopUps: number;
  totalWithdrawals: number;
  netIncome: number;
  effectiveRatePercent: number;
  schedule: DepositScheduleRow[];
  taxRows: DepositTaxRow[];
  totalTax: number;
  blockedWithdrawals: { date: string; amount: number }[];
}
