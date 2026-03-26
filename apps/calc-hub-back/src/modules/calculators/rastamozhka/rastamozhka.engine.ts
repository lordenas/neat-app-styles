import type {
  EngineType,
  RastamozhkaInput,
  RastamozhkaResult,
} from './rastamozhka.types';

function isElectroMode(t: EngineType): boolean {
  // Calcus behavior: sequential hybrid follows EV branch, parallel hybrid follows DVS branch.
  return t === 'electric' || t === 'hybrid_series';
}

function getCustomsFee(priceRub: number): number {
  if (priceRub <= 200_000) return 1_231;
  if (priceRub <= 450_000) return 2_462;
  if (priceRub <= 1_200_000) return 4_924;
  if (priceRub <= 2_700_000) return 13_541;
  if (priceRub <= 4_200_000) return 18_465;
  if (priceRub <= 5_500_000) return 21_344;
  if (priceRub <= 10_000_000) return 49_240;
  return 73_860;
}

function individualDuty_new(
  priceEur: number,
  vol: number,
): { eur: number; note: string } {
  let pct: number, perCc: number;
  if (priceEur <= 8_500) {
    pct = 0.54;
    perCc = 2.5;
  } else if (priceEur <= 16_700) {
    pct = 0.48;
    perCc = 3.5;
  } else if (priceEur <= 42_300) {
    pct = 0.48;
    perCc = 5.5;
  } else if (priceEur <= 84_500) {
    pct = 0.48;
    perCc = 7.5;
  } else if (priceEur <= 169_000) {
    pct = 0.48;
    perCc = 15;
  } else {
    pct = 0.48;
    perCc = 20;
  }
  const eur = Math.max(priceEur * pct, perCc * vol);
  return { eur, note: `${(pct * 100).toFixed(0)}%, но не менее €${perCc}/см³` };
}

function individualDuty_3_5(vol: number): { eur: number; note: string } {
  let r: number;
  if (vol <= 1000) r = 1.5;
  else if (vol <= 1500) r = 1.7;
  else if (vol <= 1800) r = 2.5;
  else if (vol <= 2300) r = 2.7;
  else if (vol <= 3000) r = 3.0;
  else r = 3.6;
  return { eur: r * vol, note: `€${r}/см³` };
}

function individualDuty_5plus(vol: number): { eur: number; note: string } {
  let r: number;
  if (vol <= 1000) r = 3.0;
  else if (vol <= 1500) r = 3.2;
  else if (vol <= 1800) r = 3.5;
  else if (vol <= 2300) r = 4.8;
  else if (vol <= 3000) r = 5.0;
  else r = 5.7;
  return { eur: r * vol, note: `€${r}/см³` };
}

function legalDutyDvs(
  ageGroup: string,
  priceEur: number,
  vol: number,
  isDiesel: boolean,
): { eur: number; note: string } {
  if (ageGroup === 'new' || ageGroup === '1-3') {
    if (isDiesel) return { eur: priceEur * 0.15, note: '15% от стоимости' };
    const rate = vol > 2800 ? 0.125 : 0.15;
    return { eur: priceEur * rate, note: `${rate * 100}% от стоимости` };
  }
  if (ageGroup === '3-5' || ageGroup === '5-7') {
    const adValorem = priceEur * 0.2;
    let perCc: number;
    if (isDiesel) {
      perCc = vol <= 1500 ? 0.32 : vol <= 2500 ? 0.4 : 0.8;
    } else {
      if (vol <= 1000) perCc = 0.36;
      else if (vol <= 1500) perCc = 0.4;
      else if (vol <= 1800) perCc = 0.36;
      else if (vol <= 2300) perCc = 0.44;
      else if (vol <= 2800) perCc = 0.44;
      else if (vol <= 3000) perCc = 0.44;
      else perCc = 0.8;
    }
    return {
      eur: Math.max(adValorem, perCc * vol),
      note: `20%, но не менее €${perCc}/см³`,
    };
  }
  let r: number;
  if (isDiesel) {
    r = vol <= 1500 ? 1.5 : vol <= 2500 ? 2.2 : 3.2;
  } else {
    if (vol <= 1000) r = 1.4;
    else if (vol <= 1500) r = 1.5;
    else if (vol <= 1800) r = 1.6;
    else if (vol <= 2300) r = 2.2;
    else if (vol <= 2800) r = 2.2;
    else if (vol <= 3000) r = 2.2;
    else r = 3.2;
  }
  return { eur: r * vol, note: `€${r}/см³` };
}

function getExciseRate(hp: number): number {
  if (hp <= 90) return 0;
  if (hp <= 150) return 64;
  if (hp <= 200) return 613;
  if (hp <= 300) return 1004;
  if (hp <= 400) return 1711;
  if (hp <= 500) return 1771;
  return 1829;
}

function getDvsRecyclingCoeff(hp: number, isNew: boolean): number {
  if (isNew) {
    if (hp <= 175) return 45;
    if (hp <= 200) return 47.64;
    if (hp <= 250) return 50.52;
    if (hp <= 300) return 64.56;
    if (hp <= 350) return 83.16;
    if (hp <= 400) return 94.8;
    return 94.8;
  } else {
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
  horsePower: number,
): number {
  const base = 20_000;
  const isPersonal = importerType === 'individual';
  const isCommercialImport = importerType !== 'individual';
  const isElectro = isElectroMode(engineType);
  const isNew = ageGroup === 'new' || ageGroup === '1-3';

  if (isElectro) {
    if (isPersonal && horsePower <= 80) {
      return Math.round(base * (isNew ? 0.17 : 0.26));
    }
    return Math.round(base * 78);
  }

  if (isPersonal && horsePower <= 160 && vol <= 3000) {
    return Math.round(base * (isNew ? 0.17 : 0.26));
  }

  // Calcus behavior for non-personal import (legal entity / individual for resale):
  // significantly higher fixed recycling coefficients by age bucket.
  if (isCommercialImport) {
    return Math.round(base * (isNew ? 40.04 : 172.8));
  }

  if (horsePower <= 160) {
    let coeff: number;
    if (vol <= 1000) coeff = isNew ? 1.65 : 6.15;
    else if (vol <= 2000) coeff = isNew ? 4.2 : 15.69;
    else if (vol <= 3000) coeff = isNew ? 6.3 : 24.01;
    else if (vol <= 3500) coeff = isNew ? 5.73 : 29.15;
    else coeff = isNew ? 9.08 : 74.25;
    return Math.round(base * coeff);
  }

  return Math.round(base * getDvsRecyclingCoeff(horsePower, isNew));
}

export function calcRastamozhka(input: RastamozhkaInput): RastamozhkaResult {
  const {
    priceEur,
    engineVolume,
    horsePower,
    engineType,
    ageGroup,
    importerType,
    eurRate,
  } = input;
  const priceRub = priceEur * eurRate;
  const isElectro = isElectroMode(engineType);
  const isDiesel = engineType === 'diesel';

  const customsFee = getCustomsFee(priceRub);

  let dutyEur: number;
  let dutyNote: string;

  if (isElectro) {
    dutyEur = priceEur * 0.15;
    dutyNote = '15% от стоимости';
  } else if (importerType === 'individual') {
    if (ageGroup === 'new' || ageGroup === '1-3') {
      const r = individualDuty_new(priceEur, engineVolume);
      dutyEur = r.eur;
      dutyNote = r.note;
    } else if (ageGroup === '3-5') {
      const r = individualDuty_3_5(engineVolume);
      dutyEur = r.eur;
      dutyNote = r.note;
    } else {
      const r = individualDuty_5plus(engineVolume);
      dutyEur = r.eur;
      dutyNote = r.note;
    }
  } else {
    const r = legalDutyDvs(ageGroup, priceEur, engineVolume, isDiesel);
    dutyEur = r.eur;
    dutyNote = r.note;
  }

  const duty = Math.round(dutyEur * eurRate);
  const recyclingFee = getRecyclingFee(
    ageGroup,
    engineVolume,
    importerType,
    engineType,
    horsePower,
  );

  const needsExciseVat = isElectro || importerType !== 'individual';
  let excise = 0;
  let vat = 0;
  if (needsExciseVat) {
    excise = Math.round(getExciseRate(horsePower) * horsePower);
    vat = Math.round((priceRub + duty + excise) * 0.22);
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
    dutyNote,
  };
}
