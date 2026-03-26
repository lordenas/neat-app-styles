export type PreviousUsePeriod = 'before_2014' | 'after_2014';

export interface PropertyDeductionInput {
  propertyPrice: number;
  purchaseYear: number;
  usedPreviously: boolean;
  previousUsePeriod: PreviousUsePeriod | null;
  returnedAmount: number;
  incomeByYear: Record<number, number>;
}

export interface PropertyDeductionResult {
  unusedDeduction: number;
  taxToReturn: number;
  totalNdflEntered: number;
  availableFromEnteredYears: number;
  remainingForFutureYears: number;
  yearsWithIncome: number[];
  isFullyBlocked: boolean;
}
