export interface UnusedVacationExcludedPeriod {
  from: Date;
  to: Date;
  label?: string;
}

export interface UnusedVacationInput {
  avgDailyPay: number;
  startDate: Date;
  endDate: Date;
  annualVacationDays: number;
  usedVacationDays: number;
  excludedPeriods?: UnusedVacationExcludedPeriod[];
}

export interface UnusedVacationResult {
  workedMonths: number;
  excludedDays: number;
  earnedDays: number;
  unusedDays: number;
  compensation: number;
  ndfl: number;
  netPay: number;
}
