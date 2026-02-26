/**
 * Калькулятор растаможки автомобиля при ввозе в РФ.
 * Ставки актуальны на 2026 год.
 *
 * Типы гибридов:
 *  - hybrid_parallel (параллельный) — ДВС + эл. мотор вместе приводят колёса.
 *    Пошлины/утильсбор — как бензиновый ДВС.
 *  - hybrid_series (последовательный) — движение только от эл. мотора, ДВС = генератор.
 *    Пошлины — как электромобиль (15%), утильсбор — как электромобиль.
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

// ─── Хелперы типа двигателя ───────────────────────────────────────────────────
function isElectricType(t: EngineType): boolean {
  return t === "electric" || t === "hybrid_series";
}
// Для расчёта пошлины параллельный гибрид = бензин, последовательный = электро
function dutyEngineClass(t: EngineType): "electric" | "petrol" | "diesel" {
  if (isElectricType(t)) return "electric";
  if (t === "diesel") return "diesel";
  return "petrol"; // petrol + hybrid_parallel
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

// ─── Пошлина физлицо, до 3 лет (max % или €/см³) ────────────────────────────
function individualDuty_new(priceEur: number, vol: number): { eur: number; note: string } {
  let pct: number, perCc: number;
  if (priceEur <= 8_500)        { pct = 0.54; perCc = 2.5; }
  else if (priceEur <= 16_700)  { pct = 0.48; perCc = 3.5; }
  else if (priceEur <= 42_300)  { pct = 0.48; perCc = 5.5; }
  else if (priceEur <= 84_500)  { pct = 0.48; perCc = 7.5; }
  else if (priceEur <= 169_000) { pct = 0.48; perCc = 15; }
  else                           { pct = 0.48; perCc = 20; }
  const byPct = priceEur * pct;
  const byVol = perCc * vol;
  const eur = Math.max(byPct, byVol);
  const note = `${(pct * 100).toFixed(0)}%, но не менее €${perCc}/см³`;
  return { eur, note };
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
function legalDuty(
  ageGroup: string,
  priceEur: number,
  vol: number,
  dClass: "electric" | "petrol" | "diesel"
): { eur: number; note: string } {
  if (dClass === "electric") {
    return { eur: priceEur * 0.15, note: "15% от стоимости" };
  }

  if (ageGroup === "new" || ageGroup === "1-3") {
    if (dClass === "diesel") {
      return { eur: priceEur * 0.15, note: "15% от стоимости" };
    }
    // бензин/параллельный гибрид
    const rate = vol > 2800 ? 0.125 : 0.15;
    return { eur: priceEur * rate, note: `${rate * 100}% от стоимости` };
  }

  if (ageGroup === "3-5" || ageGroup === "5-7") {
    const adValorem = priceEur * 0.20;
    let perCc: number;
    if (dClass === "diesel") {
      if (vol <= 1500)      perCc = 0.32;
      else if (vol <= 2500) perCc = 0.40;
      else                   perCc = 0.80;
    } else {
      if (vol <= 1000)      perCc = 0.36;
      else if (vol <= 1500) perCc = 0.40;
      else if (vol <= 1800) perCc = 0.36;
      else if (vol <= 2300) perCc = 0.44;
      else if (vol <= 2800) perCc = 0.44;
      else if (vol <= 3000) perCc = 0.44;
      else                   perCc = 0.80;
    }
    const byVol = perCc * vol;
    const eur = Math.max(adValorem, byVol);
    const note = `20%, но не менее €${perCc}/см³`;
    return { eur, note };
  }

  // 7+ лет: специфическая €/см³
  let r: number;
  if (dClass === "diesel") {
    if (vol <= 1500)      r = 1.5;
    else if (vol <= 2500) r = 2.2;
    else                   r = 3.2;
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
function getRecyclingFee(
  ageGroup: string,
  vol: number,
  importerType: string,
  engineType: EngineType,
  horsePower: number
): number {
  const isPersonal = importerType === "individual";
  const isElec = isElectricType(engineType);

  if (isPersonal) {
    // Льготный утильсбор: база 20 000, коэф 0.17 / 0.26
    // Условие: объём ≤ 3000 см³ и мощность ≤ 160 л.с. (для электро ≤ 80 л.с.)
    const qualifies = isElec ? horsePower <= 80 : (vol <= 3000 && horsePower <= 160);
    if (qualifies) {
      const coeff = (ageGroup === "new" || ageGroup === "1-3") ? 0.17 : 0.26;
      return Math.round(20_000 * coeff);
    }
  }

  // Юрлицо / перепродажа / физлицо вне льготы
  const base = 20_000;
  // Для последовательного гибрида и электро — как электромобиль (effVol = 0)
  const effVol = isElec ? 0 : vol;
  const isNew = ageGroup === "new" || ageGroup === "1-3";

  let coeff: number;
  if (effVol === 0)        coeff = isNew ? 1.65 : 6.15;
  else if (effVol <= 1000) coeff = isNew ? 1.65 : 6.15;
  else if (effVol <= 2000) coeff = isNew ? 4.2  : 15.69;
  else if (effVol <= 3000) coeff = isNew ? 6.3  : 24.01;
  else if (effVol <= 3500) coeff = isNew ? 5.73 : 29.15;
  else                      coeff = isNew ? 9.08 : 74.25;

  return Math.round(base * coeff);
}

// ─── Основная функция ─────────────────────────────────────────────────────────
export function calcRastamozhka(input: RastamozhkaInput): RastamozhkaResult {
  const { priceEur, engineVolume, horsePower, engineType, ageGroup, importerType, eurRate } = input;
  const priceRub = priceEur * eurRate;
  const dClass = dutyEngineClass(engineType);
  const isElec = isElectricType(engineType);

  // 1. Таможенный сбор
  const customsFee = getCustomsFee(priceRub);

  // 2. Таможенная пошлина
  let dutyEur: number;
  let dutyNote: string;

  if (importerType === "individual") {
    if (isElec) {
      dutyEur = priceEur * 0.15;
      dutyNote = "15% от стоимости";
    } else if (ageGroup === "new" || ageGroup === "1-3") {
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
    const r = legalDuty(ageGroup, priceEur, engineVolume, dClass);
    dutyEur = r.eur; dutyNote = r.note;
  }

  const duty = Math.round(dutyEur * eurRate);

  // 3. Утилизационный сбор
  const recyclingFee = getRecyclingFee(ageGroup, engineVolume, importerType, engineType, horsePower);

  // 4. Акциз и НДС
  //    Электро (включая последовательный гибрид): платят все
  //    Бензин/дизель/параллельный гибрид: только юрлица и перепродажа
  const needsExciseVat = isElec || importerType !== "individual";
  let excise = 0;
  let vat = 0;
  if (needsExciseVat) {
    excise = Math.round(getExciseRate(horsePower) * horsePower);
    vat = Math.round((priceRub + duty + excise) * 0.20);
  }

  const total = customsFee + duty + recyclingFee + excise + vat;

  return { customsFee, duty, recyclingFee, excise, vat, total, totalRub: total, dutyNote };
}
