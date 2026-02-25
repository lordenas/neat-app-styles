/**
 * Калькулятор транспортного налога.
 * Ставки — базовые по НК РФ ст. 361 (регионы могут отличать в 10 раз).
 */

export type TransportTaxInput = {
  /** Мощность двигателя (л.с.) */
  horsePower: number;
  /** Регион (код) */
  regionCode: string;
  /** Количество полных месяцев владения в году (1-12) */
  ownershipMonths: number;
  /** Стоимость автомобиля (руб) — для расчёта повышающего коэффициента */
  carPrice: number;
  /** Год выпуска автомобиля */
  carYear: number;
  /** Налоговый год */
  taxYear: number;
};

export type TransportTaxResult = {
  baseRate: number;
  regionalRate: number;
  luxuryMultiplier: number;
  ownershipCoeff: number;
  taxAmount: number;
};

// Базовые ставки НК РФ (руб./л.с.)
function getBaseRate(hp: number): number {
  if (hp <= 100) return 2.5;
  if (hp <= 150) return 3.5;
  if (hp <= 200) return 5;
  if (hp <= 250) return 7.5;
  return 15;
}

// Региональные множители (относительно базовой ставки)
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  "77": 5, "78": 5, "50": 4.2, "16": 4.2, "23": 4,
  "52": 4.5, "54": 4, "61": 4, "63": 4.8, "66": 3.8,
  "74": 3.6, "24": 3.6, "25": 4, "34": 4.6, "72": 4,
  "55": 3, "59": 5, "29": 5, "56": 3, "35": 5,
};

// Повышающий коэффициент на роскошь (Кп)
function getLuxuryMultiplier(price: number, carAge: number): number {
  if (price < 10_000_000) return 1;
  if (price < 15_000_000) return carAge <= 10 ? 2 : 1;
  return carAge <= 20 ? 3 : 1;
}

export function calcTransportTax(input: TransportTaxInput): TransportTaxResult {
  const baseRate = getBaseRate(input.horsePower);
  const mult = REGIONAL_MULTIPLIERS[input.regionCode] ?? 3;
  const regionalRate = baseRate * mult;
  const carAge = input.taxYear - input.carYear;
  const luxuryMultiplier = getLuxuryMultiplier(input.carPrice, carAge);
  const ownershipCoeff = Math.min(input.ownershipMonths, 12) / 12;

  const taxAmount = Math.round(
    input.horsePower * regionalRate * ownershipCoeff * luxuryMultiplier
  );

  return { baseRate, regionalRate, luxuryMultiplier, ownershipCoeff, taxAmount };
}
