/**
 * Калькулятор растаможки автомобиля при ввозе в РФ.
 * Включает: таможенный сбор, пошлину, утильсбор, акциз, НДС.
 */

export type RastamozhkaInput = {
  /** Стоимость авто (евро) */
  priceEur: number;
  /** Объём двигателя (куб. см) */
  engineVolume: number;
  /** Мощность (л.с.) — для акциза */
  horsePower: number;
  /** Возраст авто: "new" | "1-3" | "3-5" | "5-7" | "7+" */
  ageGroup: "new" | "1-3" | "3-5" | "5-7" | "7+";
  /** Тип ввозящего: физлицо или юрлицо */
  importerType: "individual" | "legal";
  /** Курс EUR/RUB */
  eurRate: number;
};

export type RastamozhkaResult = {
  customsFee: number;
  duty: number;
  recyclingFee: number;
  excise: number;
  vat: number;
  total: number;
  totalRub: number;
};

// Таможенный сбор (руб) по стоимости
function getCustomsFee(priceRub: number): number {
  if (priceRub <= 200_000) return 775;
  if (priceRub <= 450_000) return 1550;
  if (priceRub <= 1_200_000) return 3100;
  if (priceRub <= 2_700_000) return 8530;
  if (priceRub <= 4_200_000) return 12000;
  if (priceRub <= 5_500_000) return 15500;
  if (priceRub <= 7_000_000) return 20000;
  return 30000;
}

// Единая ставка пошлины для физлиц (евро за куб.см)
function getIndividualDutyRate(ageGroup: string, priceEur: number, engineVol: number): number {
  if (ageGroup === "new") {
    // Для новых авто — 48% стоимости, но не менее определённой ставки за куб.см
    const pctDuty = priceEur * 0.48;
    const perCcRates: [number, number][] = [
      [800, 3.5], [1000, 3.5], [1500, 5.5], [1800, 7.5], [2300, 15], [3000, 20], [Infinity, 20],
    ];
    let perCcRate = 20;
    for (const [limit, rate] of perCcRates) {
      if (engineVol <= limit) { perCcRate = rate; break; }
    }
    return Math.max(pctDuty, perCcRate * engineVol) / engineVol;
  }
  if (ageGroup === "1-3") {
    if (engineVol <= 1000) return 1.5;
    if (engineVol <= 1500) return 1.7;
    if (engineVol <= 1800) return 2.5;
    if (engineVol <= 2300) return 2.7;
    if (engineVol <= 3000) return 3.0;
    return 3.6;
  }
  // 3-5, 5-7, 7+
  if (engineVol <= 1000) return 3.0;
  if (engineVol <= 1500) return 3.2;
  if (engineVol <= 1800) return 3.5;
  if (engineVol <= 2300) return 4.8;
  if (engineVol <= 3000) return 5.0;
  return 5.7;
}

// Акциз (руб./л.с.)
function getExciseRate(hp: number): number {
  if (hp <= 90) return 0;
  if (hp <= 150) return 61;
  if (hp <= 200) return 583;
  if (hp <= 300) return 955;
  if (hp <= 400) return 1628;
  if (hp <= 500) return 1685;
  return 1740;
}

// Утильсбор (базовая ставка × коэффициент)
function getRecyclingFee(ageGroup: string, engineVol: number, importerType: string): number {
  const base = importerType === "individual" ? 3400 : 20000;
  let coeff = 1;
  if (importerType === "individual") {
    coeff = (ageGroup === "new" || ageGroup === "1-3") ? 0.17 : 0.26;
  } else {
    if (engineVol <= 1000) coeff = ageGroup === "new" ? 1.65 : 6.15;
    else if (engineVol <= 2000) coeff = ageGroup === "new" ? 4.2 : 15.69;
    else if (engineVol <= 3000) coeff = ageGroup === "new" ? 6.3 : 24.01;
    else if (engineVol <= 3500) coeff = ageGroup === "new" ? 5.73 : 29.15;
    else coeff = ageGroup === "new" ? 9.08 : 74.25;
  }
  return Math.round(base * coeff);
}

export function calcRastamozhka(input: RastamozhkaInput): RastamozhkaResult {
  const priceRub = input.priceEur * input.eurRate;

  const customsFee = getCustomsFee(priceRub);

  let dutyEur: number;
  if (input.importerType === "individual") {
    const rate = getIndividualDutyRate(input.ageGroup, input.priceEur, input.engineVolume);
    dutyEur = rate * input.engineVolume;
  } else {
    // Юрлицо: 15% от стоимости для новых, 20% для б/у
    const pct = input.ageGroup === "new" ? 0.15 : 0.20;
    dutyEur = input.priceEur * pct;
  }
  const duty = Math.round(dutyEur * input.eurRate);

  const recyclingFee = getRecyclingFee(input.ageGroup, input.engineVolume, input.importerType);

  let excise = 0;
  let vat = 0;
  if (input.importerType === "legal") {
    excise = Math.round(getExciseRate(input.horsePower) * input.horsePower);
    vat = Math.round((priceRub + duty + excise) * 0.20);
  }

  const total = customsFee + duty + recyclingFee + excise + vat;

  return {
    customsFee,
    duty,
    recyclingFee,
    excise,
    vat,
    total,
    totalRub: total,
  };
}
