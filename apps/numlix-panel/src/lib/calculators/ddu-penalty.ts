/**
 * Расчёт неустойки по ДДУ (214-ФЗ): физ/юр лицо, моратории, ключевая ставка,
 * перенос срока по ст. 193 ГК, период с ограничением ставки 7,5%.
 */

import {
  addDays,
  differenceInCalendarDays,
  isBefore,
  isAfter,
  parseISO,
  format,
} from "date-fns";
import { ru } from "date-fns/locale";
import { isWorkday } from "@/lib/calculators/production-calendar-ru";
import type { KeyRateEntry } from "@/lib/calculators/peni";

export type DduPayerType = "individual" | "legal";

export type ApplyRateType =
  | "on_transfer_day"
  | "on_obligation_day"
  | "by_period";

export type DduPenaltyInput = {
  price: number;
  contractTransferDate: string;
  actualTransferDate: string;
  doNotShiftDeadline: boolean;
  applyRate: ApplyRateType;
  payerType: DduPayerType;
};

export type DduBreakdownRow = {
  periodLabel: string;
  comment?: string;
  days: number;
  ratePercent: number;
  rateNominalPercent?: number;
  formula: string;
  penalty: number;
  isMoratorium: boolean;
};

export type DduPenaltyResult = {
  penaltyStartDate: string;
  totalPenalty: number;
  breakdown: DduBreakdownRow[];
};

export const DDU_MORATORIUM_PERIODS: { from: string; to: string; comment: string }[] = [
  {
    from: "2020-04-03",
    to: "2020-12-31",
    comment: "Постановление правительства РФ № 423 от 02.04.2020",
  },
  {
    from: "2022-03-29",
    to: "2023-06-30",
    comment: "Постановление правительства РФ № 479 от 26.03.2022 и № 1732 от 30.09.2022",
  },
  {
    from: "2024-03-22",
    to: "2025-12-31",
    comment: "Постановление правительства РФ № 326 от 18.03.2024, № 1916 от 26.12.2024, № 925 от 19.06.2025",
  },
];

const DDU_RATE_CAP_FROM = "2023-07-01";
const DDU_RATE_CAP_TO = "2024-03-21";
const DDU_RATE_CAP_VALUE = 7.5;

const FRACTION_1_150 = 1 / 150;
const FRACTION_1_300 = 1 / 300;

function formatNum(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatRateForFormula(rate: number): string {
  const s = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rate);
  return s.replace(/\s/g, "");
}

function getEffectiveDeadline(contractDate: string, doNotShift: boolean): string {
  if (doNotShift) return contractDate;
  const d = parseISO(contractDate);
  const dateStr = format(d, "yyyy-MM-dd");
  if (isWorkday(dateStr)) return contractDate;
  let next = addDays(d, 1);
  let nextStr = format(next, "yyyy-MM-dd");
  while (!isWorkday(nextStr)) {
    next = addDays(next, 1);
    nextStr = format(next, "yyyy-MM-dd");
  }
  return nextStr;
}

function getRateOnDate(rates: KeyRateEntry[], dateStr: string): number {
  if (!rates.length) return 0;
  const d = parseISO(dateStr);
  let value = rates[0].value;
  for (const r of rates) {
    const rDate = parseISO(r.date);
    if (isBefore(d, rDate) && r.date !== dateStr) break;
    value = r.value;
  }
  return value > 50 ? value / 10 : value;
}

function isSegmentInMoratorium(
  d1: string,
  d2: string,
  periods: { from: string; to: string }[]
): boolean {
  const lastDay = addDays(parseISO(d2), -1);
  for (const p of periods) {
    const exFrom = parseISO(p.from);
    const exTo = parseISO(p.to);
    const segStart = parseISO(d1);
    if (!isBefore(segStart, exFrom) && !isBefore(exTo, lastDay)) return true;
  }
  return false;
}

function getMoratoriumComment(d1: string, d2: string): string | undefined {
  const lastDay = addDays(parseISO(d2), -1);
  for (const p of DDU_MORATORIUM_PERIODS) {
    const exFrom = parseISO(p.from);
    const exTo = parseISO(p.to);
    const segStart = parseISO(d1);
    if (!isBefore(segStart, exFrom) && !isBefore(exTo, lastDay))
      return p.comment;
  }
  return undefined;
}

function applyRateCap(rate: number, d1: string, d2: string): number {
  const capFrom = parseISO(DDU_RATE_CAP_FROM);
  const capTo = parseISO(DDU_RATE_CAP_TO);
  const segStart = parseISO(d1);
  const segEnd = addDays(parseISO(d2), -1);
  const overlap = !isBefore(segEnd, capFrom) && !isBefore(capTo, segStart);
  if (!overlap) return rate;
  return Math.min(rate, DDU_RATE_CAP_VALUE);
}

export function calcDduPenalty(
  input: DduPenaltyInput,
  keyRates: KeyRateEntry[]
): DduPenaltyResult | null {
  const {
    price,
    contractTransferDate,
    actualTransferDate,
    doNotShiftDeadline,
    applyRate,
    payerType,
  } = input;

  if (price <= 0 || !keyRates.length) return null;
  const effectiveDeadline = getEffectiveDeadline(contractTransferDate, doNotShiftDeadline);
  const penaltyStart = format(addDays(parseISO(effectiveDeadline), 1), "yyyy-MM-dd");
  const end = parseISO(actualTransferDate);
  const start = parseISO(penaltyStart);
  if (!isBefore(start, end) && penaltyStart !== actualTransferDate) return null;

  const endNext = format(addDays(parseISO(actualTransferDate), 1), "yyyy-MM-dd");

  const boundarySet = new Set<string>();
  boundarySet.add(penaltyStart);
  boundarySet.add(endNext);
  DDU_MORATORIUM_PERIODS.forEach((p) => {
    boundarySet.add(p.from);
    boundarySet.add(format(addDays(parseISO(p.to), 1), "yyyy-MM-dd"));
  });
  if (applyRate === "by_period") {
    keyRates.forEach((r) => boundarySet.add(r.date));
  }

  const boundaries = Array.from(boundarySet).filter((d) => {
    const parsed = parseISO(d);
    return !isBefore(parsed, start) && !isAfter(parsed, parseISO(endNext));
  });
  boundaries.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const rateOnTransfer = getRateOnDate(keyRates, actualTransferDate);
  const rateOnObligation = getRateOnDate(keyRates, contractTransferDate);
  const fraction = payerType === "individual" ? FRACTION_1_150 : FRACTION_1_300;

  const breakdown: DduBreakdownRow[] = [];
  let totalPenalty = 0;

  for (let i = 0; i < boundaries.length; i++) {
    const d1 = boundaries[i];
    const d2 = i + 1 < boundaries.length ? boundaries[i + 1] : endNext;
    const d1Parsed = parseISO(d1);
    const d2Parsed = parseISO(d2);
    if (!isBefore(d1Parsed, d2Parsed)) continue;

    const days = differenceInCalendarDays(d2Parsed, d1Parsed);
    const periodLabel = `${format(parseISO(d1), "dd.MM.yyyy", { locale: ru })} – ${format(addDays(parseISO(d2), -1), "dd.MM.yyyy", { locale: ru })}`;

    const inMoratorium = isSegmentInMoratorium(d1, d2, DDU_MORATORIUM_PERIODS);

    if (inMoratorium) {
      const comment = getMoratoriumComment(d1, d2);
      breakdown.push({
        periodLabel: `${periodLabel} (мораторий, неустойка не начисляется)`,
        comment: comment ?? undefined,
        days: 0,
        ratePercent: 0,
        formula: "",
        penalty: 0,
        isMoratorium: true,
      });
      continue;
    }

    let rateNominal: number;
    if (applyRate === "on_transfer_day") rateNominal = rateOnTransfer;
    else if (applyRate === "on_obligation_day") rateNominal = rateOnObligation;
    else rateNominal = getRateOnDate(keyRates, d1);
    const rateApplied = applyRateCap(rateNominal, d1, d2);
    const wasCapped = rateApplied < rateNominal && rateNominal > DDU_RATE_CAP_VALUE;

    const penaltyRaw = price * days * fraction * (rateApplied / 100);
    const penalty = Math.round(penaltyRaw * 100) / 100;
    totalPenalty += penaltyRaw;

    const formula = `${formatNum(price)} × ${days} × ${payerType === "individual" ? "1/150" : "1/300"} × ${formatRateForFormula(rateApplied)}%`;
    breakdown.push({
      periodLabel,
      days,
      ratePercent: rateApplied,
      rateNominalPercent: wasCapped ? rateNominal : undefined,
      formula,
      penalty,
      isMoratorium: false,
    });
  }

  const totalRounded = Math.round(totalPenalty * 100) / 100;

  return {
    penaltyStartDate: penaltyStart,
    totalPenalty: totalRounded,
    breakdown,
  };
}
