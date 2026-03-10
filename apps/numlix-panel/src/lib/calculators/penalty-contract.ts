/**
 * Расчёт неустойки по договору (РФ): календарные или рабочие дни,
 * ставка в % годовых / % в день / твёрдая сумма в день, лимит, исключения, выплаты, доп. задолженности.
 */

import {
  addDays,
  differenceInCalendarDays,
  isBefore,
  parseISO,
  format,
} from "date-fns";
import { ru } from "date-fns/locale";
import { getWorkdaysCount } from "@/lib/calculators/production-calendar-ru";

export type ExcludedPeriod = {
  from: string;
  to: string;
  comment?: string;
};

export type PartialPayment = {
  date: string;
  amount: number;
  comment?: string;
};

export type AdditionalDebt = {
  date: string;
  amount: number;
  comment?: string;
};

export type RateType =
  | "percent_per_year"
  | "percent_per_day"
  | "fixed_per_day";

export type LimitType = "fixed" | "percent";

export type PenaltyContractInput = {
  sum: number;
  startDate: string;
  endDate: string;
  workdaysOnly: boolean;
  excludedPeriods: ExcludedPeriod[];
  rateType: RateType;
  rateValue: number;
  limitType?: LimitType;
  limitValue?: number;
  partialPayments: PartialPayment[];
  additionalDebts: AdditionalDebt[];
  showPerDebt: boolean;
};

export type PenaltyBreakdownRow = {
  amountLabel: string;
  periodLabel: string;
  comment?: string;
  days: number;
  formula: string;
  penalty: number;
  isExcluded?: boolean;
  isPayment?: boolean;
  isAdditionalDebt?: boolean;
  debtIndex?: number;
};

export type PenaltyContractResult = {
  totalPenalty: number;
  totalPenaltyCapped: number;
  limitApplied: number | null;
  totalDebtAndPenalty: number;
  breakdown: PenaltyBreakdownRow[];
  breakdownByDebt?: PenaltyBreakdownRow[][];
  capByDebt?: number[];
  limitPercent?: number;
};

function formatNum(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function getDaysInYearForSegment(d1: string, d2: string): number {
  const segStart = parseISO(d1);
  const segEnd = addDays(parseISO(d2), -1);
  let daysInLeap = 0;
  const totalDays = differenceInCalendarDays(parseISO(d2), parseISO(d1));
  for (const year of [2020, 2024, 2028]) {
    const yStart = parseISO(`${year}-01-01`);
    const yEnd = parseISO(`${year}-12-31`);
    const clampStart = isBefore(segStart, yStart) ? yStart : segStart;
    const clampEnd = isBefore(segEnd, yEnd) ? segEnd : yEnd;
    if (!isBefore(clampEnd, yStart) && !isBefore(yEnd, clampStart)) {
      daysInLeap += differenceInCalendarDays(addDays(clampEnd, 1), clampStart);
    }
  }
  return daysInLeap > totalDays / 2 ? 366 : 365;
}

function isSegmentExcluded(
  d1: string,
  d2: string,
  excluded: ExcludedPeriod[]
): boolean {
  const lastDay = addDays(parseISO(d2), -1);
  for (const ex of excluded) {
    const exFrom = parseISO(ex.from);
    const exTo = parseISO(ex.to);
    const segStart = parseISO(d1);
    if (!isBefore(segStart, exFrom) && !isBefore(exTo, lastDay)) return true;
  }
  return false;
}

export function calcPenaltyContract(
  input: PenaltyContractInput
): PenaltyContractResult | null {
  const {
    sum,
    startDate,
    endDate,
    workdaysOnly,
    excludedPeriods,
    rateType,
    rateValue,
    limitType,
    limitValue,
    partialPayments,
    additionalDebts,
    showPerDebt,
  } = input;

  if (sum <= 0) return null;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (!isBefore(start, end) && startDate !== endDate) return null;

  const boundarySet = new Set<string>();
  boundarySet.add(startDate);
  excludedPeriods.forEach((ex) => {
    boundarySet.add(ex.from);
    boundarySet.add(ex.to);
    try {
      boundarySet.add(format(addDays(parseISO(ex.to), 1), "yyyy-MM-dd"));
    } catch { /* ignore */ }
  });
  partialPayments.forEach((p) => {
    boundarySet.add(p.date);
    try {
      boundarySet.add(format(addDays(parseISO(p.date), 1), "yyyy-MM-dd"));
    } catch { /* ignore */ }
  });
  additionalDebts.forEach((a) => boundarySet.add(a.date));
  const endNext = format(addDays(parseISO(endDate), 1), "yyyy-MM-dd");
  boundarySet.add(endNext);

  const boundaries = Array.from(boundarySet).filter((d) => {
    const parsed = parseISO(d);
    return (
      !isBefore(parsed, start) &&
      !isBefore(addDays(parseISO(endDate), 1), parsed)
    );
  });
  boundaries.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const paymentsByDate = new Map<string, number>();
  partialPayments.forEach((p) => {
    paymentsByDate.set(p.date, (paymentsByDate.get(p.date) ?? 0) + p.amount);
  });
  const additionalByDate = new Map<string, AdditionalDebt[]>();
  additionalDebts.forEach((a) => {
    if (!additionalByDate.has(a.date)) additionalByDate.set(a.date, []);
    additionalByDate.get(a.date)!.push(a);
  });

  const debtStreams: { startDate: string; initialAmount: number }[] = [
    { startDate: startDate, initialAmount: sum },
  ];
  additionalDebts
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .forEach((a) => {
      debtStreams.push({ startDate: a.date, initialAmount: a.amount });
    });

  let mainBalance = sum;
  const segments: {
    d1: string;
    d2: string;
    balances: number[];
  }[] = [];

  for (let i = 0; i < boundaries.length; i++) {
    const d1 = boundaries[i];
    const d2 = i + 1 < boundaries.length ? boundaries[i + 1] : endNext;
    const d1Parsed = parseISO(d1);
    const d2Parsed = parseISO(d2);
    if (!isBefore(d1Parsed, d2Parsed)) continue;

    const balances = debtStreams.map((stream, idx) => {
      if (idx === 0) return mainBalance;
      const streamStart = parseISO(stream.startDate);
      return !isBefore(d1Parsed, streamStart) ? stream.initialAmount : 0;
    });
    segments.push({ d1, d2, balances });

    const pay = paymentsByDate.get(d1) ?? 0;
    if (pay > 0) mainBalance = Math.max(0, mainBalance - pay);
  }

  const allRows: PenaltyBreakdownRow[] = [];
  let totalPenalty = 0;
  const penaltyByDebt: number[] = new Array(debtStreams.length).fill(0);
  const rowsByDebt: PenaltyBreakdownRow[][] = debtStreams.map(() => []);

  for (const seg of segments) {
    const daysCal = differenceInCalendarDays(parseISO(seg.d2), parseISO(seg.d1));
    const days = workdaysOnly ? getWorkdaysCount(seg.d1, seg.d2) : daysCal;
    const excluded = isSegmentExcluded(seg.d1, seg.d2, excludedPeriods);
    const periodLabel = `${format(parseISO(seg.d1), "dd.MM.yyyy", { locale: ru })} – ${format(addDays(parseISO(seg.d2), -1), "dd.MM.yyyy", { locale: ru })}`;

    if (rateType === "fixed_per_day") {
      const penaltySegRaw = excluded || days <= 0 ? 0 : days * rateValue;
      if (!excluded && days > 0) {
        totalPenalty += penaltySegRaw;
        penaltyByDebt[0] += penaltySegRaw;
      }
      const penaltySeg = Math.round(penaltySegRaw * 100) / 100;
      const formula = excluded || days <= 0 ? "" : `${days} × ${formatNum(rateValue)} ₽`;
      const row: PenaltyBreakdownRow = {
        amountLabel: formatNum(seg.balances[0]) + " ₽",
        periodLabel,
        days,
        formula,
        penalty: penaltySeg,
        isExcluded: excluded,
        debtIndex: 0,
      };
      allRows.push(row);
      rowsByDebt[0].push(row);
    } else {
      for (let streamIdx = 0; streamIdx < debtStreams.length; streamIdx++) {
        const balance = seg.balances[streamIdx];
        if (balance <= 0) continue;

        let penaltySegRaw = 0;
        let formula = "";
        if (!excluded && days > 0) {
          if (rateType === "percent_per_year") {
            const daysInYear = getDaysInYearForSegment(seg.d1, seg.d2);
            penaltySegRaw = balance * (days / daysInYear) * (rateValue / 100);
            formula = `${formatNum(balance)} × ${days} / ${daysInYear} × ${rateValue}%`;
          } else {
            penaltySegRaw = balance * days * (rateValue / 100);
            formula = `${formatNum(balance)} × ${days} × ${rateValue}%`;
          }
        }
        if (!excluded) {
          totalPenalty += penaltySegRaw;
          penaltyByDebt[streamIdx] += penaltySegRaw;
        }
        const penaltySeg = Math.round(penaltySegRaw * 100) / 100;

        const row: PenaltyBreakdownRow = {
          amountLabel: formatNum(balance) + " ₽",
          periodLabel,
          days,
          formula,
          penalty: penaltySeg,
          isExcluded: excluded,
          debtIndex: streamIdx,
        };
        allRows.push(row);
        rowsByDebt[streamIdx].push(row);
      }
    }

    const eventDate = seg.d1;
    const adds = additionalByDate.get(eventDate) ?? [];
    const pays = partialPayments.filter((p) => p.date === eventDate && p.amount > 0);
    for (const a of adds) {
      const streamIdx = debtStreams.findIndex(
        (s) => s.startDate === a.date && s.initialAmount === a.amount
      );
      const debtIndex = streamIdx >= 0 ? streamIdx : debtStreams.length - 1;
      const row: PenaltyBreakdownRow = {
        amountLabel: "+" + formatNum(a.amount) + " ₽",
        periodLabel: format(parseISO(a.date), "dd.MM.yyyy", { locale: ru }) + " (доп. задолженность)",
        comment: a.comment?.trim() || undefined,
        days: 0,
        formula: "",
        penalty: 0,
        isAdditionalDebt: true,
        debtIndex,
      };
      allRows.push(row);
      if (!rowsByDebt[debtIndex]) rowsByDebt[debtIndex] = [];
      rowsByDebt[debtIndex].push(row);
    }
    for (const p of pays) {
      const row: PenaltyBreakdownRow = {
        amountLabel: "−" + formatNum(p.amount) + " ₽",
        periodLabel: format(parseISO(p.date), "dd.MM.yyyy", { locale: ru }) + " (оплата)",
        comment: p.comment?.trim() || undefined,
        days: 0,
        formula: "",
        penalty: 0,
        isPayment: true,
        debtIndex: 0,
      };
      allRows.push(row);
      rowsByDebt[0].push(row);
    }
  }

  const totalDebt =
    sum +
    additionalDebts.reduce((acc, a) => acc + a.amount, 0) -
    partialPayments.reduce((acc, p) => acc + p.amount, 0);
  let limitApplied: number | null = null;
  let totalPenaltyCapped: number;
  if (limitType && limitValue != null && limitValue > 0) {
    if (limitType === "percent") {
      totalPenaltyCapped = debtStreams.reduce((acc, stream, i) => {
        const cap = (stream.initialAmount * limitValue) / 100;
        const capped = Math.min(penaltyByDebt[i], cap);
        return acc + capped;
      }, 0);
      limitApplied = debtStreams.reduce(
        (acc, stream) => acc + (stream.initialAmount * limitValue) / 100,
        0
      );
    } else {
      limitApplied = limitValue;
      totalPenaltyCapped = Math.min(totalPenalty, limitValue);
    }
  } else {
    totalPenaltyCapped = totalPenalty;
  }
  const totalPenaltyRounded = Math.round(totalPenalty * 100) / 100;
  const totalPenaltyCappedRounded = Math.round(totalPenaltyCapped * 100) / 100;
  const totalDebtAndPenalty = totalDebt + totalPenaltyCappedRounded;

  const result: PenaltyContractResult = {
    totalPenalty: totalPenaltyRounded,
    totalPenaltyCapped: totalPenaltyCappedRounded,
    limitApplied,
    totalDebtAndPenalty,
    breakdown: allRows,
  };
  if (showPerDebt) {
    result.breakdownByDebt = rowsByDebt;
  }
  if (limitType === "percent" && limitValue != null && limitValue > 0) {
    result.limitPercent = limitValue;
    result.capByDebt = debtStreams.map(
      (stream) => (stream.initialAmount * limitValue) / 100
    );
  }
  return result;
}
