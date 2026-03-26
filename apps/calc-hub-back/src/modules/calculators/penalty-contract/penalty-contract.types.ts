export interface PenaltyContractExcludedPeriod {
  from: string;
  to: string;
  comment?: string;
}

export interface PenaltyContractPartialPayment {
  date: string;
  amount: number;
  comment?: string;
}

export interface PenaltyContractAdditionalDebt {
  date: string;
  amount: number;
  comment?: string;
}

export type PenaltyContractRateType =
  | 'percent_per_year'
  | 'percent_per_day'
  | 'fixed_per_day';

export type PenaltyContractLimitType = 'fixed' | 'percent';

export interface PenaltyContractInput {
  sum: number;
  startDate: string;
  endDate: string;
  workdaysOnly: boolean;
  excludedPeriods: PenaltyContractExcludedPeriod[];
  rateType: PenaltyContractRateType;
  rateValue: number;
  limitType?: PenaltyContractLimitType;
  limitValue?: number;
  partialPayments: PenaltyContractPartialPayment[];
  additionalDebts: PenaltyContractAdditionalDebt[];
  showPerDebt: boolean;
}

export interface PenaltyBreakdownRow {
  amountLabel: string;
  periodLabel: string;
  comment?: string;
  days: number;
  formula: string;
  penalty: number;
  isExcluded?: boolean;
  isPayment?: boolean;
  isAdditionalDebt?: boolean;
  debtIndex?: number;
}

export interface PenaltyContractResult {
  totalPenalty: number;
  totalPenaltyCapped: number;
  limitApplied: number | null;
  totalDebtAndPenalty: number;
  breakdown: PenaltyBreakdownRow[];
  breakdownByDebt?: PenaltyBreakdownRow[][];
  capByDebt?: number[];
  limitPercent?: number;
}
