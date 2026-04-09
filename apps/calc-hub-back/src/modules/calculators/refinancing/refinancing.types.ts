export type TermUnit = 'years' | 'months';

export type SchedulePeriod = 'year' | 'month';

export interface RefinancingInput {
  remainingDebt: number;
  remainingTerm: number;
  termUnit: TermUnit;
  currentRate: number;
  newAmount?: number;
  newTerm?: number;
  newTermUnit?: TermUnit;
  newRate?: number;
  amountChanged: boolean;
  termChanged: boolean;
  rateChanged: boolean;
}

export interface RefinancingResult {
  currentMonthlyPayment: number;
  currentTotalInterest: number;
  currentTotalPayment: number;
  refinancedMonthlyPayment: number;
  refinancedTotalInterest: number;
  refinancedTotalPayment: number;
  monthlyPaymentDelta: number;
  totalInterestDelta: number;
  effectivePrincipal: number;
  effectiveTermMonths: number;
  effectiveRate: number;
}

export interface RefinancingScheduleRow {
  year: number;
  month?: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface RefinancingChartData {
  year: number;
  paid: number;
  interest: number;
  balance: number;
}
