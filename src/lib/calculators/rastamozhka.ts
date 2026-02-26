/**
 * Калькулятор растаможки автомобиля при ввозе в РФ.
 * Ставки актуальны на 2026 год (сверено с calcus.ru).
 *
 * Типы двигателей:
 *  petrol           — бензиновый ДВС
 *  diesel           — дизельный ДВС
 *  electric         — чистый электромобиль
 *  hybrid_parallel  — параллельный гибрид (считается КАК электромобиль: пошлина 15%, акциз/НДС/утиль по электро)
 *  hybrid_series    — последовательный гибрид (аналогично электромобилю)
 */

export type EngineType = "petrol" | "diesel" | "electric" | "hybrid_parallel" | "hybrid_series";

export type RastamozhkaInput = {
  priceEur: number;
  engineVolume: number;
  horsePower: number;
  engineType: EngineType;
  ageGroup: "new" | "1-3" | "3-5" | "5-7" | "7+";
  importerType: "individual" | "individual_resale" | "legal";
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
  dutyNote: string;
};

// Электромобили и оба типа гибридов — «электро-режим» для расчётов
function isElectroMode(t: EngineType): boolean {
  return t === "electric" || t === "hybrid_parallel" || t === "hybrid_series";
}

// ─── Таможенный сбор (с 01.01.2026) ──────────────────────────────────────────
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

// ─── Пошлина физлицо, до 3 лет ───────────────────────────────────────────────
function individualDuty_new(priceEur: number, vol: number): { eur: number; note: string } {
  let pct: number, perCc: number;
  if (priceEur <= 8_500)        { pct = 0.54; perCc = 2.5; }
  else if (priceEur <= 16_700)  { pct = 0.48; perCc = 3.5; }
  else if (priceEur <= 42_300)  { pct = 0.48; perCc = 5.5; }
  else if (priceEur <= 84_500)  { pct = 0.48; perCc = 7.5; }
  else if (priceEur <= 169_000) { pct = 0.48; perCc = 15; }
  else                           { pct = 0.48; perCc = 20; }
  const eur = Math.max(priceEur * pct, perCc * vol);
  return { eur, note: `${(pct * 100).toFixed(0)}%, но не менее €${perCc}/см³` };
}

function individualDuty_3_5(vol: number): { eur: number; note: string } {
  let r: number;
  if (vol <= 1000)      r = 1.5;
  else if (vol <= 1500) r = 1.7;
  else if (vol <= 1800) r = 2.5;
  else if (vol <= 2300) r = 2.7;
  else if (vol <= 3000) r = 3.0;
  else                   r = 3.6;
  return { eur: r * vol, note: `€${r}/см³` };
}

function individualDuty_5plus(vol: number): { eur: number; note: string } {
  let r: number;
  if (vol <= 1000)      r = 3.0;
  else if (vol <= 1500) r = 3.2;
  else if (vol <= 1800) r = 3.5;
  else if (vol <= 2300) r = 4.8;
  else if (vol <= 3000) r = 5.0;
  else                   r = 5.7;
  return { eur: r * vol, note: `€${r}/см³` };
}

// ─── Пошлина юрлицо / физлицо для перепродажи ───────────────────────────────
function legalDutyDvs(
  ageGroup: string,
  priceEur: number,
  vol: number,
  isDiesel: boolean
): { eur: number; note: string } {
  if (ageGroup === "new" || ageGroup === "1-3") {
    if (isDiesel) return { eur: priceEur * 0.15, note: "15% от стоимости" };
    const rate = vol > 2800 ? 0.125 : 0.15;
    return { eur: priceEur * rate, note: `${rate * 100}% от стоимости` };
  }
  if (ageGroup === "3-5" || ageGroup === "5-7") {
    const adValorem = priceEur * 0.20;
    let perCc: number;
    if (isDiesel) {
      perCc = vol <= 1500 ? 0.32 : vol <= 2500 ? 0.40 : 0.80;
    } else {
      if (vol <= 1000)      perCc = 0.36;
      else if (vol <= 1500) perCc = 0.40;
      else if (vol <= 1800) perCc = 0.36;
      else if (vol <= 2300) perCc = 0.44;
      else if (vol <= 2800) perCc = 0.44;
      else if (vol <= 3000) perCc = 0.44;
      else                   perCc = 0.80;
    }
    return { eur: Math.max(adValorem, perCc * vol), note: `20%, но не менее €${perCc}/см³` };
  }
  // 7+ лет
  let r: number;
  if (isDiesel) {
    r = vol <= 1500 ? 1.5 : vol <= 2500 ? 2.2 : 3.2;
  } else {
    if (vol <= 1000)      r = 1.4;
    else if (vol <= 1500) r = 1.5;
    else if (vol <= 1800) r = 1.6;
    else if (vol <= 2300) r = 2.2;
    else if (vol <= 2800) r = 2.2;
    else if (vol <= 3000) r = 2.2;
    else                   r = 3.2;
  }
  return { eur: r * vol, note: `€${r}/см³` };
}

// ─── Акциз (с 01.01.2026) ────────────────────────────────────────────────────
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
// Коэффициенты по мощности (сверено с calcus.ru 2026):
//
// ДВС — новый (до 3 лет):  ≤160=льгота(0.17), 161-200=45, 201-250=47.64, 251-300=50.52, 301-350=64.56, 351-400=83.16, >400=94.8
// ДВС — 3-5 лет:           ≤160=льгота(0.26), 161-200=74.64, 201-250=79.2, ...
// ДВС — 5-7 лет:           аналогично 3-5
// ДВС — 7+ лет:            аналогично 3-5
//
// Электро/гибриды — новый: ≤80=льгота(0.17 если физлицо личное), >80=78
// Электро/гибриды — 3+ лет: ≤80=льгота(0.26 если физлицо личное), >80=78

function getDvsRecyclingCoeff(hp: number, isNew: boolean): number {
  if (isNew) {
    // до 3 лет (сверено с calcus.ru):
    // 161→45, 200→47.64, 250→50.52, 300→64.56, 350→83.16, 400→94.8
    if (hp <= 175) return 45;      // ~161-175
    if (hp <= 200) return 47.64;   // 176-200
    if (hp <= 250) return 50.52;   // 201-250
    if (hp <= 300) return 64.56;   // 251-300
    if (hp <= 350) return 83.16;   // 301-350
    if (hp <= 400) return 94.8;    // 351-400
    return 94.8;                   // >400
  } else {
    // 3+ лет (сверено: 161→74.64, 200→79.2)
    if (hp <= 175) return 74.64;
    if (hp <= 200) return 79.2;
    if (hp <= 250) return 101.04;
    if (hp <= 300) return 133.92;
    if (hp <= 350) return 152.04;
    if (hp <= 400) return 172.44;
    return 172.44;
  }
}

function getRecyclingFee(
  ageGroup: string,
  vol: number,
  importerType: string,
  engineType: EngineType,
  horsePower: number
): number {
  const base = 20_000;
  const isPersonal = importerType === "individual";
  const isElectro = isElectroMode(engineType);
  const isNew = ageGroup === "new" || ageGroup === "1-3";

  if (isElectro) {
    // Льготный: только физлицо личное И мощность ≤80 л.с.
    if (isPersonal && horsePower <= 80) {
      return Math.round(base * (isNew ? 0.17 : 0.26));
    }
    // Иначе: 78 для нового и для старших (сверено с calcus.ru: 150 л.с. → 20000×78)
    return Math.round(base * 78);
  }

  // ДВС (бензин/дизель/параллельный гибрид уже обрабатывается как бензин выше)
  if (isPersonal && horsePower <= 160 && vol <= 3000) {
    // Льготный утильсбор
    return Math.round(base * (isNew ? 0.17 : 0.26));
  }

  // Вне льготы: шкала по мощности (физлицо >160 л.с., юрлицо, перепродажа)
  if (horsePower <= 160) {
    // Физлицо с объёмом >3000 или юрлицо ≤160 л.с.
    // Используем коэффициенты по объёму для юрлица ≤160 л.с.
    let coeff: number;
    if (vol <= 1000)      coeff = isNew ? 1.65  : 6.15;
    else if (vol <= 2000) coeff = isNew ? 4.2   : 15.69;
    else if (vol <= 3000) coeff = isNew ? 6.3   : 24.01;
    else if (vol <= 3500) coeff = isNew ? 5.73  : 29.15;
    else                   coeff = isNew ? 9.08  : 74.25;
    return Math.round(base * coeff);
  }

  // >160 л.с.: шкала по мощности (сверено с calcus.ru)
  return Math.round(base * getDvsRecyclingCoeff(horsePower, isNew));
}

// ─── Основная функция ─────────────────────────────────────────────────────────
export function calcRastamozhka(input: RastamozhkaInput): RastamozhkaResult {
  const { priceEur, engineVolume, horsePower, engineType, ageGroup, importerType, eurRate } = input;
  const priceRub = priceEur * eurRate;
  const isElectro = isElectroMode(engineType);
  const isDiesel = engineType === "diesel";

  // 1. Таможенный сбор
  const customsFee = getCustomsFee(priceRub);

  // 2. Таможенная пошлина
  let dutyEur: number;
  let dutyNote: string;

  if (isElectro) {
    // Электро и оба гибрида: всегда 15% от стоимости
    dutyEur = priceEur * 0.15;
    dutyNote = "15% от стоимости";
  } else if (importerType === "individual") {
    // Физлицо, личное, ДВС
    if (ageGroup === "new" || ageGroup === "1-3") {
      const r = individualDuty_new(priceEur, engineVolume);
      dutyEur = r.eur; dutyNote = r.note;
    } else if (ageGroup === "3-5") {
      const r = individualDuty_3_5(engineVolume);
      dutyEur = r.eur; dutyNote = r.note;
    } else {
      const r = individualDuty_5plus(engineVolume);
      dutyEur = r.eur; dutyNote = r.note;
    }
  } else {
    // Юрлицо / перепродажа, ДВС
    const r = legalDutyDvs(ageGroup, priceEur, engineVolume, isDiesel);
    dutyEur = r.eur; dutyNote = r.note;
  }

  const duty = Math.round(dutyEur * eurRate);

  // 3. Утилизационный сбор
  const recyclingFee = getRecyclingFee(ageGroup, engineVolume, importerType, engineType, horsePower);

  // 4. Акциз и НДС
  //    Электро (включая гибриды): начисляется всем
  //    ДВС: только юрлицам и при перепродаже
  const needsExciseVat = isElectro || importerType !== "individual";

  let excise = 0;
  let vat = 0;
  if (needsExciseVat) {
    excise = Math.round(getExciseRate(horsePower) * horsePower);
    // НДС: 22% для электро, 20% для ДВС юрлица
    const vatRate = isElectro ? 0.22 : 0.20;
    vat = Math.round((priceRub + duty + excise) * vatRate);
  }

  const total = customsFee + duty + recyclingFee + excise + vat;

  return { customsFee, duty, recyclingFee, excise, vat, total, totalRub: total, dutyNote };
}
