export interface KeyRateEntry {
  date: string;
  value: number;
}

export type PeniCalculationType = 'tax' | 'utilities' | 'salary';
export type TaxPayerType = 'individual' | 'legal';

export interface PeniInput {
  debt: number;
  calcType: PeniCalculationType;
  payerType: TaxPayerType;
  dateFrom: string;
  dateTo: string;
}

export interface PeniBreakdownRow {
  dateFrom: string;
  dateTo: string;
  keyRate: number;
  fraction: number;
  dailyPeni: number;
  days: number;
}

export interface PeniResult {
  totalDays: number;
  totalPeni: number;
  breakdown: PeniBreakdownRow[];
}
