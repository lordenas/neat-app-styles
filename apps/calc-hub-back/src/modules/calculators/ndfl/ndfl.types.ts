export type IncomeType =
  | 'salary'
  | 'svo'
  | 'property_sale'
  | 'rent'
  | 'securities'
  | 'dividends'
  | 'deposit_interest'
  | 'prize'
  | 'manual';

export type NdflDirection = 'fromGross' | 'fromNet';

export interface TaxBracket {
  limit: number;
  ratePercent: number;
}

export interface IncomeTypeOption {
  id: IncomeType;
  defaultRatePercent: number;
  useProgressive: boolean;
  useSvoScale: boolean;
  usePropertySaleScale: boolean;
}

export interface NdflInput {
  income: number;
  incomeType: IncomeType;
  isNonResident: boolean;
  direction: NdflDirection;
  manualRate?: number | null;
}

export interface NdflResult {
  gross: number;
  tax: number;
  net: number;
  effectiveRate: number;
}
