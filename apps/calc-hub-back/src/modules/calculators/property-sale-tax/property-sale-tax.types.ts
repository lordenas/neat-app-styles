export type AcquisitionType = 'purchase' | 'other';

export interface PropertySaleTaxInput {
  ownershipBefore2016: boolean;
  acquisitionType: AcquisitionType;
  isSoleHousing: boolean;
  yearsHeld: number;
  salePrice: number;
  cadastralValue: number;
  coefficient: number;
  useFixedDeduction: boolean;
  purchaseExpenses: number;
  saleAfter2025: boolean;
}

export interface PropertySaleTaxRateBreakdown {
  incomeAt13: number;
  taxAt13: number;
  incomeAt15: number;
  taxAt15: number;
}

export interface PropertySaleTaxResult {
  taxableIncome: number;
  taxableBase: number;
  tax: number;
  minPeriodYears: number;
  noTax: boolean;
  useSalePriceForIncome: boolean;
  cadastralIncome: number;
  explanation: string;
  rateBreakdown?: PropertySaleTaxRateBreakdown;
}
