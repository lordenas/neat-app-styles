export type EngineType =
  | 'petrol'
  | 'diesel'
  | 'electric'
  | 'hybrid_parallel'
  | 'hybrid_series';

export type AgeGroup = 'new' | '1-3' | '3-5' | '5-7' | '7+';

export type ImporterType = 'individual' | 'individual_resale' | 'legal';

export interface RastamozhkaInput {
  priceEur: number;
  engineVolume: number;
  horsePower: number;
  engineType: EngineType;
  ageGroup: AgeGroup;
  importerType: ImporterType;
  eurRate: number;
}

export interface RastamozhkaResult {
  customsFee: number;
  duty: number;
  recyclingFee: number;
  excise: number;
  vat: number;
  total: number;
  totalRub: number;
  dutyNote: string;
}
