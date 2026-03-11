/**
 * НДФЛ (налог на доходы физических лиц) — данные и типы для РФ.
 * Прогрессивная шкала с 2025 года.
 */

export const PROGRESSIVE_BRACKETS_2025: { limit: number; ratePercent: number }[] = [
  { limit: 2_400_000, ratePercent: 13 },
  { limit: 5_000_000, ratePercent: 15 },
  { limit: 20_000_000, ratePercent: 18 },
  { limit: 50_000_000, ratePercent: 20 },
  { limit: Infinity, ratePercent: 22 },
];

export const SVO_BRACKETS: { limit: number; ratePercent: number }[] = [
  { limit: 5_000_000, ratePercent: 13 },
  { limit: Infinity, ratePercent: 15 },
];

export const PROPERTY_SALE_BRACKETS: { limit: number; ratePercent: number }[] = [
  { limit: 2_400_000, ratePercent: 13 },
  { limit: Infinity, ratePercent: 15 },
];

export const RK_ALLOWANCE_BRACKETS = SVO_BRACKETS;

export type IncomeType =
  | "salary" | "svo" | "property_sale" | "rent" | "securities"
  | "dividends" | "deposit_interest" | "prize" | "manual";

export type IncomeTypeOption = {
  id: IncomeType;
  label: string;
  defaultRatePercent: number;
  useProgressive: boolean;
  useSvoScale: boolean;
  usePropertySaleScale: boolean;
};

export const INCOME_TYPE_OPTIONS: IncomeTypeOption[] = [
  { id: "salary", label: "Зарплата", defaultRatePercent: 13, useProgressive: true, useSvoScale: false, usePropertySaleScale: false },
  { id: "svo", label: "Выплаты СВО", defaultRatePercent: 13, useProgressive: false, useSvoScale: true, usePropertySaleScale: false },
  { id: "property_sale", label: "Продажа имущества", defaultRatePercent: 13, useProgressive: false, useSvoScale: false, usePropertySaleScale: true },
  { id: "rent", label: "Аренда", defaultRatePercent: 13, useProgressive: false, useSvoScale: false, usePropertySaleScale: true },
  { id: "securities", label: "Ценные бумаги", defaultRatePercent: 13, useProgressive: false, useSvoScale: false, usePropertySaleScale: true },
  { id: "dividends", label: "Дивиденды", defaultRatePercent: 13, useProgressive: false, useSvoScale: false, usePropertySaleScale: true },
  { id: "deposit_interest", label: "Проценты по вкладам", defaultRatePercent: 13, useProgressive: false, useSvoScale: false, usePropertySaleScale: true },
  { id: "prize", label: "Приз/выигрыш", defaultRatePercent: 35, useProgressive: true, useSvoScale: false, usePropertySaleScale: false },
  { id: "manual", label: "Указать ставку вручную", defaultRatePercent: 13, useProgressive: false, useSvoScale: false, usePropertySaleScale: false },
];

export const NON_RESIDENT_RATE_OTHER = 30;
export const NON_RESIDENT_RATE_DIVIDENDS_INTEREST = 15;

export function getDefaultRateForIncomeType(type: IncomeType, isNonResident: boolean): number {
  if (isNonResident) {
    const divTypes: IncomeType[] = ["dividends", "deposit_interest"];
    return divTypes.includes(type) ? NON_RESIDENT_RATE_DIVIDENDS_INTEREST : NON_RESIDENT_RATE_OTHER;
  }
  const opt = INCOME_TYPE_OPTIONS.find((o) => o.id === type);
  return opt?.defaultRatePercent ?? 13;
}

export function getIncomeTypeOption(type: IncomeType): IncomeTypeOption | undefined {
  return INCOME_TYPE_OPTIONS.find((o) => o.id === type);
}

/** Расчёт НДФЛ по прогрессивной шкале */
export function calculateProgressiveNdfl(annualIncome: number, brackets: { limit: number; ratePercent: number }[]): number {
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    const taxable = Math.min(annualIncome, b.limit) - prev;
    if (taxable <= 0) break;
    tax += taxable * (b.ratePercent / 100);
    prev = b.limit;
  }
  return Math.round(tax * 100) / 100;
}

/** Расчёт НДФЛ по плоской ставке */
export function calculateFlatNdfl(income: number, ratePercent: number): number {
  return Math.round(income * (ratePercent / 100) * 100) / 100;
}
