import type {
  IncomeType,
  IncomeTypeOption,
  NdflInput,
  NdflResult,
  TaxBracket,
} from './ndfl.types';

export const PROGRESSIVE_BRACKETS_2025: TaxBracket[] = [
  { limit: 2_400_000, ratePercent: 13 },
  { limit: 5_000_000, ratePercent: 15 },
  { limit: 20_000_000, ratePercent: 18 },
  { limit: 50_000_000, ratePercent: 20 },
  { limit: Infinity, ratePercent: 22 },
];

export const SVO_BRACKETS: TaxBracket[] = [
  { limit: 5_000_000, ratePercent: 13 },
  { limit: Infinity, ratePercent: 15 },
];

export const PROPERTY_SALE_BRACKETS: TaxBracket[] = [
  { limit: 2_400_000, ratePercent: 13 },
  { limit: Infinity, ratePercent: 15 },
];

export const INCOME_TYPE_OPTIONS: IncomeTypeOption[] = [
  {
    id: 'salary',
    defaultRatePercent: 13,
    useProgressive: true,
    useSvoScale: false,
    usePropertySaleScale: false,
  },
  {
    id: 'svo',
    defaultRatePercent: 13,
    useProgressive: false,
    useSvoScale: true,
    usePropertySaleScale: false,
  },
  {
    id: 'property_sale',
    defaultRatePercent: 13,
    useProgressive: false,
    useSvoScale: false,
    usePropertySaleScale: true,
  },
  {
    id: 'rent',
    defaultRatePercent: 13,
    useProgressive: false,
    useSvoScale: false,
    usePropertySaleScale: true,
  },
  {
    id: 'securities',
    defaultRatePercent: 13,
    useProgressive: false,
    useSvoScale: false,
    usePropertySaleScale: true,
  },
  {
    id: 'dividends',
    defaultRatePercent: 13,
    useProgressive: false,
    useSvoScale: false,
    usePropertySaleScale: true,
  },
  {
    id: 'deposit_interest',
    defaultRatePercent: 13,
    useProgressive: false,
    useSvoScale: false,
    usePropertySaleScale: true,
  },
  {
    id: 'prize',
    defaultRatePercent: 35,
    useProgressive: true,
    useSvoScale: false,
    usePropertySaleScale: false,
  },
  {
    id: 'manual',
    defaultRatePercent: 13,
    useProgressive: false,
    useSvoScale: false,
    usePropertySaleScale: false,
  },
];

const NON_RESIDENT_RATE_OTHER = 30;
const NON_RESIDENT_RATE_DIVIDENDS_INTEREST = 15;

export function getDefaultRateForIncomeType(
  type: IncomeType,
  isNonResident: boolean,
): number {
  if (isNonResident) {
    const divTypes: IncomeType[] = ['dividends', 'deposit_interest'];
    return divTypes.includes(type)
      ? NON_RESIDENT_RATE_DIVIDENDS_INTEREST
      : NON_RESIDENT_RATE_OTHER;
  }
  const opt = INCOME_TYPE_OPTIONS.find((o) => o.id === type);
  return opt?.defaultRatePercent ?? 13;
}

export function getIncomeTypeOption(
  type: IncomeType,
): IncomeTypeOption | undefined {
  return INCOME_TYPE_OPTIONS.find((o) => o.id === type);
}

export function calculateProgressiveNdfl(
  annualIncome: number,
  brackets: TaxBracket[],
): number {
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

export function calculateFlatNdfl(income: number, ratePercent: number): number {
  return Math.round(income * (ratePercent / 100) * 100) / 100;
}

export function calcNdfl(input: NdflInput): NdflResult | null {
  const { income, incomeType, isNonResident, direction, manualRate } = input;
  if (income <= 0) return null;

  let tax: number;
  let effectiveRate: number;
  const typeOption = getIncomeTypeOption(incomeType);

  if (isNonResident) {
    effectiveRate = manualRate ?? getDefaultRateForIncomeType(incomeType, true);
    if (direction === 'fromGross') {
      tax = calculateFlatNdfl(income, effectiveRate);
      return {
        gross: income,
        tax,
        net: Math.round((income - tax) * 100) / 100,
        effectiveRate,
      };
    }
    const gross = income / (1 - effectiveRate / 100);
    tax = calculateFlatNdfl(gross, effectiveRate);
    return {
      gross: Math.round(gross * 100) / 100,
      tax,
      net: income,
      effectiveRate,
    };
  }

  if (incomeType === 'manual') {
    effectiveRate = manualRate ?? 13;
    if (direction === 'fromGross') {
      tax = calculateFlatNdfl(income, effectiveRate);
      return {
        gross: income,
        tax,
        net: Math.round((income - tax) * 100) / 100,
        effectiveRate,
      };
    }
    const gross = income / (1 - effectiveRate / 100);
    tax = calculateFlatNdfl(gross, effectiveRate);
    return {
      gross: Math.round(gross * 100) / 100,
      tax,
      net: income,
      effectiveRate,
    };
  }

  let brackets = PROGRESSIVE_BRACKETS_2025;
  if (typeOption?.useSvoScale) brackets = SVO_BRACKETS;
  if (typeOption?.usePropertySaleScale) brackets = PROPERTY_SALE_BRACKETS;

  if (
    typeOption?.useProgressive ||
    typeOption?.useSvoScale ||
    typeOption?.usePropertySaleScale
  ) {
    if (direction === 'fromGross') {
      tax = calculateProgressiveNdfl(income, brackets);
      effectiveRate = income > 0 ? Math.round((tax / income) * 10000) / 100 : 0;
      return {
        gross: income,
        tax,
        net: Math.round((income - tax) * 100) / 100,
        effectiveRate,
      };
    }
    let lo = income;
    let hi = income * 2;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      const t = calculateProgressiveNdfl(mid, brackets);
      if (mid - t < income) lo = mid;
      else hi = mid;
    }
    const gross = Math.round(((lo + hi) / 2) * 100) / 100;
    tax = calculateProgressiveNdfl(gross, brackets);
    effectiveRate = gross > 0 ? Math.round((tax / gross) * 10000) / 100 : 0;
    return { gross, tax, net: income, effectiveRate };
  }

  effectiveRate = typeOption?.defaultRatePercent ?? 13;
  if (direction === 'fromGross') {
    tax = calculateFlatNdfl(income, effectiveRate);
    return {
      gross: income,
      tax,
      net: Math.round((income - tax) * 100) / 100,
      effectiveRate,
    };
  }
  const gross = income / (1 - effectiveRate / 100);
  tax = calculateFlatNdfl(gross, effectiveRate);
  return {
    gross: Math.round(gross * 100) / 100,
    tax,
    net: income,
    effectiveRate,
  };
}
