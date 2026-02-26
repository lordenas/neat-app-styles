/**
 * Калькулятор растаможки автомобиля при ввозе в РФ.
 * Ставки актуальны на 2026 год.
 */

export type EngineType = "petrol" | "diesel" | "electric" | "hybrid";

export type RastamozhkaInput = {
  /** Стоимость авто в евро */
  priceEur: number;
  /** Объём двигателя (куб. см) */
  engineVolume: number;
  /** Мощность (л.с.) — для акциза */
  horsePower: number;
  /** Тип двигателя */
  engineType: EngineType;
  /** Возраст авто */
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

// ─── Таможенный сбор (актуально с 01.01.2026) ────────────────────────────────
function getCustomsFee(priceRub: number): number {
  if (priceRub <= 200_000)    return 1_231;
  if (priceRub <= 450_000)    return 2_462;
  if (priceRub <= 1_200_000)  return 4_924;
  if (priceRub <= 2_700_000)  return 13_541;
  if (priceRub <= 4_200_000)  return 18_465;
  if (priceRub <= 5_500_000)  return 21_344;
  if (priceRub <= 10_000_000) return 49_240;
  return 73_860;
}

// ─── Пошлина для физлиц (личное пользование) ─────────────────────────────────
// Для авто до 3 лет: max(процент от стоимости, EUR/см³)
// Пороги стоимости в EUR: до 8500, до 16700, до 42300, до 84500, до 169000, свыше 169000
function getIndividualDutyEur_new(priceEur: number, vol: number): number {
  let pctRate: number;
  let perCcRate: number;

  if (priceEur <= 8_500)        { pctRate = 0.54; perCcRate = 2.5; }
  else if (priceEur <= 16_700)  { pctRate = 0.48; perCcRate = 3.5; }
  else if (priceEur <= 42_300)  { pctRate = 0.48; perCcRate = 5.5; }
  else if (priceEur <= 84_500)  { pctRate = 0.48; perCcRate = 7.5; }
  else if (priceEur <= 169_000) { pctRate = 0.48; perCcRate = 15; }
  else                           { pctRate = 0.48; perCcRate = 20; }

  return Math.max(priceEur * pctRate, perCcRate * vol);
}

// Для авто 3–5 лет (физлицо)
function getIndividualDutyEur_3_5(vol: number): number {
  if (vol <= 1000) return 1.5 * vol;
  if (vol <= 1500) return 1.7 * vol;
  if (vol <= 1800) return 2.5 * vol;
  if (vol <= 2300) return 2.7 * vol;
  if (vol <= 3000) return 3.0 * vol;
  return 3.6 * vol;
}

// Для авто 5+ лет (физлицо): одна шкала для 5-7 и 7+
function getIndividualDutyEur_5plus(vol: number): number {
  if (vol <= 1000) return 3.0 * vol;
  if (vol <= 1500) return 3.2 * vol;
  if (vol <= 1800) return 3.5 * vol;
  if (vol <= 2300) return 4.8 * vol;
  if (vol <= 3000) return 5.0 * vol;
  return 5.7 * vol;
}

// ─── Пошлина для юрлиц / физлицо для перепродажи ─────────────────────────────
function getLegalDutyEur(
  ageGroup: string,
  priceEur: number,
  vol: number,
  engineType: EngineType
): number {
  // Электромобили: 15% от стоимости для всех
  if (engineType === "electric") {
    return priceEur * 0.15;
  }

  const isDiesel = engineType === "diesel";

  if (ageGroup === "new" || ageGroup === "1-3") {
    // до 3 лет: только адвалорная ставка
    if (isDiesel) {
      return priceEur * 0.15;
    }
    // бензин/гибрид: 15% (12.5% для >2800), берём 15% как упрощение
    if (vol > 2800) return priceEur * 0.125;
    return priceEur * 0.15;
  }

  if (ageGroup === "3-5" || ageGroup === "5-7") {
    // комбинированная: max(20%, специфическая EUR/см³)
    const adValorem = priceEur * 0.20;
    let perCc: number;
    if (isDiesel) {
      if (vol <= 1500)      perCc = 0.32 * vol;
      else if (vol <= 2500) perCc = 0.40 * vol;
      else                   perCc = 0.80 * vol;
    } else {
      // бензин/гибрид
      if (vol <= 1000)      perCc = 0.36 * vol;
      else if (vol <= 1500) perCc = 0.40 * vol;
      else if (vol <= 1800) perCc = 0.36 * vol;
      else if (vol <= 2300) perCc = 0.44 * vol;
      else if (vol <= 2800) perCc = 0.44 * vol;
      else if (vol <= 3000) perCc = 0.44 * vol;
      else                   perCc = 0.80 * vol;
    }
    return Math.max(adValorem, perCc);
  }

  // 7+ лет: специфическая ставка EUR/см³
  if (isDiesel) {
    if (vol <= 1500)      return 1.5 * vol;
    if (vol <= 2500)      return 2.2 * vol;
    return 3.2 * vol;
  } else {
    // бензин/гибрид
    if (vol <= 1000)      return 1.4 * vol;
    if (vol <= 1500)      return 1.5 * vol;
    if (vol <= 1800)      return 1.6 * vol;
    if (vol <= 2300)      return 2.2 * vol;
    if (vol <= 2800)      return 2.2 * vol;
    if (vol <= 3000)      return 2.2 * vol;
    return 3.2 * vol;
  }
}

// ─── Акциз (актуально с 01.01.2026) ──────────────────────────────────────────
function getExciseRate(hp: number): number {
  if (hp <= 90)  return 0;
  if (hp <= 150) return 64;
  if (hp <= 200) return 613;
  if (hp <= 300) return 1004;
  if (hp <= 400) return 1711;
  if (hp <= 500) return 1771;
  return 1829;
}

// ─── Утилизационный сбор ─────────────────────────────────────────────────────
function getRecyclingFee(
  ageGroup: string,
  vol: number,
  importerType: string,
  engineType: EngineType,
  horsePower: number
): number {
  const isIndividualPersonal = importerType === "individual";

  if (isIndividualPersonal) {
    // Льготный утильсбор: база 20 000 руб., коэф. 0.17 / 0.26
    // Только если: объём ≤ 3000 см³, мощность ≤ 160 л.с. (или электро ≤ 80 л.с.)
    const isElectric = engineType === "electric";
    const qualifies = isElectric
      ? horsePower <= 80
      : (vol <= 3000 && horsePower <= 160);

    if (qualifies) {
      const base = 20_000;
      const coeff = (ageGroup === "new" || ageGroup === "1-3") ? 0.17 : 0.26;
      return Math.round(base * coeff);
    }
    // Если не соответствует льготным условиям — как юрлицо
  }

  // Юрлицо / физлицо для перепродажи / физлицо без льготы
  // База для легковых некоммерческих: 20 000, коммерческих: 150 000
  // Для юрлиц/перепродажи используем коэффициенты по объёму двигателя
  const base = 20_000;
  const effVol = engineType === "electric" ? 0 : vol;
  let coeff: number;

  if (effVol === 0) {
    // Электромобили — условно как <= 1000 см³
    coeff = (ageGroup === "new" || ageGroup === "1-3") ? 1.65 : 6.15;
  } else if (effVol <= 1000) {
    coeff = (ageGroup === "new" || ageGroup === "1-3") ? 1.65 : 6.15;
  } else if (effVol <= 2000) {
    coeff = (ageGroup === "new" || ageGroup === "1-3") ? 4.2 : 15.69;
  } else if (effVol <= 3000) {
    coeff = (ageGroup === "new" || ageGroup === "1-3") ? 6.3 : 24.01;
  } else if (effVol <= 3500) {
    coeff = (ageGroup === "new" || ageGroup === "1-3") ? 5.73 : 29.15;
  } else {
    coeff = (ageGroup === "new" || ageGroup === "1-3") ? 9.08 : 74.25;
  }

  return Math.round(base * coeff);
}

// ─── Основная функция ─────────────────────────────────────────────────────────
export function calcRastamozhka(input: RastamozhkaInput): RastamozhkaResult {
  const { priceEur, engineVolume, horsePower, engineType, ageGroup, importerType, eurRate } = input;
  const priceRub = priceEur * eurRate;

  // 1. Таможенный сбор
  const customsFee = getCustomsFee(priceRub);

  // 2. Таможенная пошлина
  let dutyEur: number;
  if (importerType === "individual") {
    if (engineType === "electric") {
      // Электромобиль для физлица: 15% от стоимости
      dutyEur = priceEur * 0.15;
    } else if (ageGroup === "new" || ageGroup === "1-3") {
      dutyEur = getIndividualDutyEur_new(priceEur, engineVolume);
    } else if (ageGroup === "3-5") {
      dutyEur = getIndividualDutyEur_3_5(engineVolume);
    } else {
      // 5-7 и 7+ — одна шкала
      dutyEur = getIndividualDutyEur_5plus(engineVolume);
    }
  } else {
    dutyEur = getLegalDutyEur(ageGroup, priceEur, engineVolume, engineType);
  }
  const duty = Math.round(dutyEur * eurRate);

  // 3. Утилизационный сбор
  const recyclingFee = getRecyclingFee(ageGroup, engineVolume, importerType, engineType, horsePower);

  // 4. Акциз и НДС — только для юрлиц и физлиц при перепродаже
  //    Для электромобилей — начисляются всем
  let excise = 0;
  let vat = 0;
  const isElectric = engineType === "electric";
  const needsExciseVat = importerType !== "individual" || isElectric;

  if (needsExciseVat) {
    excise = Math.round(getExciseRate(horsePower) * horsePower);
    vat = Math.round((priceRub + duty + excise) * 0.20);
  }

  const total = customsFee + duty + recyclingFee + excise + vat;

  return { customsFee, duty, recyclingFee, excise, vat, total, totalRub: total };
}
