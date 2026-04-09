import type {
  PropertyDeductionInput,
  PropertyDeductionResult,
} from './property-deduction.types';

export const MAX_PROPERTY_DEDUCTION = 2_000_000;
export const NDFL_RATE_PERCENT = 13;
export const MAX_TAX_RETURN =
  MAX_PROPERTY_DEDUCTION * (NDFL_RATE_PERCENT / 100);

function getUnusedDeductionAndTax(input: PropertyDeductionInput): {
  unusedDeduction: number;
  taxToReturn: number;
} {
  let deductionLimit = Math.min(input.propertyPrice, MAX_PROPERTY_DEDUCTION);

  if (input.usedPreviously && input.previousUsePeriod === 'before_2014') {
    return { unusedDeduction: 0, taxToReturn: 0 };
  }

  if (input.usedPreviously && input.previousUsePeriod === 'after_2014') {
    const alreadyUsed = Math.min(
      input.returnedAmount / (NDFL_RATE_PERCENT / 100),
      MAX_PROPERTY_DEDUCTION,
    );
    deductionLimit = Math.max(0, MAX_PROPERTY_DEDUCTION - alreadyUsed);
  }

  const taxToReturn =
    Math.round(deductionLimit * (NDFL_RATE_PERCENT / 100) * 100) / 100;
  return { unusedDeduction: deductionLimit, taxToReturn };
}

export function calcPropertyDeduction(
  input: PropertyDeductionInput,
): PropertyDeductionResult {
  const { unusedDeduction, taxToReturn } = getUnusedDeductionAndTax(input);
  const isFullyBlocked =
    input.usedPreviously && input.previousUsePeriod === 'before_2014';

  const yearsWithIncome = Object.keys(input.incomeByYear)
    .map(Number)
    .filter((y) => Number.isFinite(y) && (input.incomeByYear[y] ?? 0) > 0)
    .sort((a, b) => a - b);

  let totalNdflEntered = 0;
  for (const year of yearsWithIncome) {
    const income = input.incomeByYear[year] ?? 0;
    totalNdflEntered += income * (NDFL_RATE_PERCENT / 100);
  }

  const availableFromEnteredYears = Math.min(totalNdflEntered, taxToReturn);
  const remainingForFutureYears =
    Math.round((taxToReturn - availableFromEnteredYears) * 100) / 100;

  return {
    unusedDeduction,
    taxToReturn,
    totalNdflEntered: Math.round(totalNdflEntered * 100) / 100,
    availableFromEnteredYears:
      Math.round(availableFromEnteredYears * 100) / 100,
    remainingForFutureYears,
    yearsWithIncome,
    isFullyBlocked,
  };
}
