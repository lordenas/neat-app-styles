/**
 * Калькулятор растаможки автомобиля при ввозе в РФ.
 * Включает: таможенный сбор, пошлину, утильсбор, акциз, НДС.
 */

export type EngineType = "petrol" | "diesel" | "electric" | "hybrid";

export type RastamozhkaInput = {
  /** Стоимость авто (евро) */
  priceEur: number;
  /** Объём двигателя (куб. см) */
  engineVolume: number;
  /** Мощность (л.с.) — для акциза */
  horsePower: number;
  /** Тип двигателя */
  engineType: EngineType;
  /** Возраст авто: "new" | "1-3" | "3-5" | "5-7" | "7+" */
  ageGroup: "new" | "1-3" | "3-5" | "5-7" | "7+";
  /**
   * Тип ввозящего:
   * individual — физлицо для личного пользования
   * individual_resale — физлицо для перепродажи (ставки как у юрлица)
   * legal — юридическое лицо
   */
  importerType: "individual" | "individual_resale" | "legal";
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

// Единая ставка пошлины для физлиц (евро за куб.см) — для личного пользования
function getIndividualDutyRate(ageGroup: string, priceEur: number, engineVol: number): number {
  if (ageGroup === "new") {
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

/**
 * Пошлина для юрлиц / физлиц "для перепродажи".
 * Комбинированная ставка: max(% от стоимости, EUR/куб.см).
 */
function getLegalDutyEur(ageGroup: string, priceEur: number, engineVol: number, engineType: EngineType): number {
  if (engineType === "electric") {
    // Электромобили: 15% от стоимости (льготная ставка 0% до 2025, берём стандартную)
    return priceEur * 0.15;
  }

  if (ageGroup === "new") {
    // Адвалорная часть + специфическая (EUR/куб.см), берётся максимум
    const adValorem = priceEur * 0.15;
    let perCc: number;
    if (engineVol <= 1000) perCc = 0;
    else if (engineVol <= 1500) perCc = engineVol * 0.5;
    else if (engineVol <= 1800) perCc = engineVol * 0.7;
    else if (engineVol <= 2300) perCc = engineVol * 0.8;
    else if (engineVol <= 3000) perCc = engineVol * 1.0;
    else perCc = engineVol * 1.25;
    return Math.max(adValorem, perCc);
  }

  // Б/у для юрлиц / перепродажа: 20% адвалорная + специфическая EUR/куб.см
  const adValorem = priceEur * 0.20;
  let perCc: number;
  if (engineVol <= 1000) perCc = engineVol * 1.0;
  else if (engineVol <= 1500) perCc = engineVol * 1.5;
  else if (engineVol <= 1800) perCc = engineVol * 1.7;
  else if (engineVol <= 2300) perCc = engineVol * 2.0;
  else if (engineVol <= 3000) perCc = engineVol * 2.5;
  else perCc = engineVol * 2.7;
  return Math.max(adValorem, perCc);
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
function getRecyclingFee(ageGroup: string, engineVol: number, importerType: string, engineType: EngineType): number {
  const isIndividual = importerType === "individual";
  const base = isIndividual ? 3400 : 20000;

  if (isIndividual) {
    const coeff = (ageGroup === "new" || ageGroup === "1-3") ? 0.17 : 0.26;
    return Math.round(base * coeff);
  }

  // Юрлицо / перепродажа — по объёму двигателя
  // Для электромобилей используем коэффициент по мощности (условно engineVol = 0)
  const effVol = engineType === "electric" ? 0 : engineVol;
  let coeff: number;
  if (effVol <= 1000) coeff = ageGroup === "new" ? 1.65 : 6.15;
  else if (effVol <= 2000) coeff = ageGroup === "new" ? 4.2 : 15.69;
  else if (effVol <= 3000) coeff = ageGroup === "new" ? 6.3 : 24.01;
  else if (effVol <= 3500) coeff = ageGroup === "new" ? 5.73 : 29.15;
  else coeff = ageGroup === "new" ? 9.08 : 74.25;

  return Math.round(base * coeff);
}

export function calcRastamozhka(input: RastamozhkaInput): RastamozhkaResult {
  const priceRub = input.priceEur * input.eurRate;

  const customsFee = getCustomsFee(priceRub);

  let dutyEur: number;
  if (input.importerType === "individual") {
    if (input.engineType === "electric") {
      // Электромобили для физлиц: 48% стоимости (нет специфической ставки по объёму)
      dutyEur = input.priceEur * 0.48;
    } else {
      const rate = getIndividualDutyRate(input.ageGroup, input.priceEur, input.engineVolume);
      dutyEur = rate * input.engineVolume;
    }
  } else {
    // individual_resale или legal — одинаковые ставки
    dutyEur = getLegalDutyEur(input.ageGroup, input.priceEur, input.engineVolume, input.engineType);
  }
  const duty = Math.round(dutyEur * input.eurRate);

  const recyclingFee = getRecyclingFee(input.ageGroup, input.engineVolume, input.importerType, input.engineType);

  let excise = 0;
  let vat = 0;
  if (input.importerType !== "individual") {
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
