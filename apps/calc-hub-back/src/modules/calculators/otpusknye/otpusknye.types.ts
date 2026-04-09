export interface OtpusknyeExcludedPeriod {
  excludedDays: number;
  totalDaysInMonth: number;
}

export interface OtpusknyeInput {
  totalEarnings: number;
  fullMonths: number;
  partialMonths: OtpusknyeExcludedPeriod[];
  vacationDays: number;
}

export interface OtpusknyeResult {
  avgDailyPay: number;
  calcDays: number;
  vacationPay: number;
  ndfl: number;
  netPay: number;
}
