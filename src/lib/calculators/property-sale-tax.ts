/**
 * Налог с продажи квартиры (НДФЛ), НК РФ.
 * Учёт срока владения, кадастровой стоимости, вычета 1 млн ₽ или расходов на покупку.
 */

export const FIXED_DEDUCTION = 1_000_000;
export const PROGRESSION_THRESHOLD = 2_400_000;
export const RATE_FLAT_PERCENT = 13;
export const RATE_LOW_PERCENT = 13;
export const RATE_HIGH_PERCENT = 15;
export const DEFAULT_COEFFICIENT = 0.7;

export type PropertySaleTaxInput = {
  ownershipBefore2016: boolean;
  acquisitionType: "purchase" | "other";
  isSoleHousing: boolean;
  yearsHeld: number;
  salePrice: number;
  cadastralValue: number;
  coefficient: number;
  useFixedDeduction: boolean;
  purchaseExpenses: number;
  saleAfter2025: boolean;
};

export type PropertySaleTaxRateBreakdown = {
  incomeAt13: number;
  taxAt13: number;
  incomeAt15: number;
  taxAt15: number;
};

export type PropertySaleTaxResult = {
  taxableIncome: number;
  taxableBase: number;
  tax: number;
  minPeriodYears: number;
  noTax: boolean;
  useSalePriceForIncome: boolean;
  cadastralIncome: number;
  explanation: string;
  rateBreakdown?: PropertySaleTaxRateBreakdown;
};

function getMinPeriodYears(input: PropertySaleTaxInput): number {
  if (input.ownershipBefore2016) return 3;
  if (input.acquisitionType === "other") return 3;
  if (input.isSoleHousing) return 3;
  return 5;
}

function getEffectiveRate(taxableBase: number, saleAfter2025: boolean): number {
  if (!saleAfter2025) return RATE_FLAT_PERCENT / 100;
  if (taxableBase <= PROGRESSION_THRESHOLD) return RATE_LOW_PERCENT / 100;
  const above = taxableBase - PROGRESSION_THRESHOLD;
  const taxLow = PROGRESSION_THRESHOLD * (RATE_LOW_PERCENT / 100);
  const taxHigh = above * (RATE_HIGH_PERCENT / 100);
  return (taxLow + taxHigh) / taxableBase;
}

function getRatePercent(taxableBase: number, saleAfter2025: boolean): number {
  if (!saleAfter2025) return RATE_FLAT_PERCENT;
  if (taxableBase <= PROGRESSION_THRESHOLD) return RATE_LOW_PERCENT;
  return RATE_HIGH_PERCENT;
}

export function calcPropertySaleTax(
  input: PropertySaleTaxInput,
): PropertySaleTaxResult {
  const minPeriodYears = getMinPeriodYears(input);
  const cadastralIncome = Math.round(input.cadastralValue * input.coefficient * 100) / 100;
  const taxableIncome = input.salePrice >= cadastralIncome ? input.salePrice : cadastralIncome;
  const useSalePriceForIncome = input.salePrice >= cadastralIncome;

  const deduction = input.useFixedDeduction ? FIXED_DEDUCTION : Math.max(0, input.purchaseExpenses);
  const taxableBase = Math.max(0, Math.round((taxableIncome - deduction) * 100) / 100);
  const noTax = input.yearsHeld >= minPeriodYears;

  if (noTax) {
    const explanation = `Срок владения квартирой (${input.yearsHeld} ${input.yearsHeld === 1 ? "год" : input.yearsHeld < 5 ? "года" : "лет"}) не менее минимального (${minPeriodYears} лет). Налог с продажи не платится.`;
    return { taxableIncome, taxableBase, tax: 0, minPeriodYears, noTax: true, useSalePriceForIncome, cadastralIncome, explanation };
  }

  const effectiveRate = getEffectiveRate(taxableBase, input.saleAfter2025);
  const tax = Math.round(taxableBase * effectiveRate * 100) / 100;

  let rateBreakdown: PropertySaleTaxRateBreakdown | undefined;
  if (input.saleAfter2025 && !noTax && taxableBase > 0) {
    const incomeAt13 = Math.min(taxableBase, PROGRESSION_THRESHOLD);
    const incomeAt15 = Math.max(0, taxableBase - PROGRESSION_THRESHOLD);
    const taxAt13 = Math.round(incomeAt13 * (RATE_LOW_PERCENT / 100) * 100) / 100;
    const taxAt15 = Math.round(incomeAt15 * (RATE_HIGH_PERCENT / 100) * 100) / 100;
    rateBreakdown = { incomeAt13, taxAt13, incomeAt15, taxAt15 };
  }

  const periodWord = input.yearsHeld === 1 ? "год" : input.yearsHeld < 5 ? "года" : "лет";
  const ratePercent = getRatePercent(taxableBase, input.saleAfter2025);
  let explanation: string;
  if (input.saleAfter2025 && rateBreakdown) {
    explanation = `Фактический срок владения — ${input.yearsHeld} ${periodWord}, минимальный срок — ${minPeriodYears} лет. Налог считается по прогрессивной шкале: с части дохода до 2 400 000 ₽ — 13%, с суммы свыше — 15%.`;
  } else {
    explanation = `Фактический срок владения квартирой (${input.yearsHeld} ${periodWord}) меньше минимального (${minPeriodYears} лет). Налог считается как ${ratePercent}% от налогооблагаемой базы (доход от продажи минус ${input.useFixedDeduction ? "вычет 1 000 000 ₽" : "расходы на покупку"}).`;
    if (input.useFixedDeduction) {
      explanation += " Вычет можно применять не чаще одного раза в год.";
    }
  }

  return { taxableIncome, taxableBase, tax, minPeriodYears, noTax: false, useSalePriceForIncome, cadastralIncome, explanation, rateBreakdown };
}
