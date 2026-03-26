import type {
  UnusedVacationInput,
  UnusedVacationResult,
  UnusedVacationExcludedPeriod,
} from './unused-vacation.types';

function calcWorkMonths(start: Date, end: Date, excludedDays: number): number {
  const totalMs = end.getTime() - start.getTime();
  const totalDays = Math.max(
    0,
    Math.floor(totalMs / 86400000) + 1 - excludedDays,
  );
  const fullMonths = Math.floor(totalDays / 30.4);
  const remainder = totalDays % 30.4;
  return remainder >= 15 ? fullMonths + 1 : fullMonths;
}

function clampDays(
  period: UnusedVacationExcludedPeriod,
  start: Date,
  end: Date,
): number {
  const from = period.from < start ? start : period.from;
  const to = period.to > end ? end : period.to;
  if (to < from) return 0;
  return Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
}

export function calcUnusedVacation(
  input: UnusedVacationInput,
): UnusedVacationResult {
  const excluded = input.excludedPeriods ?? [];
  const excludedDays = excluded.reduce(
    (acc, p) => acc + clampDays(p, input.startDate, input.endDate),
    0,
  );

  const workedMonths = calcWorkMonths(
    input.startDate,
    input.endDate,
    excludedDays,
  );

  const effectiveMonths = workedMonths >= 11 ? 12 : workedMonths;
  const earnedDays =
    Math.round(((effectiveMonths * input.annualVacationDays) / 12) * 100) / 100;
  const unusedDays = Math.max(
    Math.round((earnedDays - input.usedVacationDays) * 100) / 100,
    0,
  );

  const compensation = Math.round(input.avgDailyPay * unusedDays * 100) / 100;
  const ndfl = Math.round(compensation * 0.13 * 100) / 100;
  const netPay = Math.round((compensation - ndfl) * 100) / 100;

  return {
    workedMonths,
    excludedDays,
    earnedDays,
    unusedDays,
    compensation,
    ndfl,
    netPay,
  };
}
