/**
 * Калькулятор компенсации за неиспользованный отпуск при увольнении (ТК РФ).
 *
 * Дни компенсации = (Отработанные месяцы × Дней отпуска в году / 12) − Использованные дни
 * Компенсация = СДЗ × Дни компенсации
 *
 * Исключаемые периоды (больничные, отпуск за свой счёт >14 дней и т.д.) вычитаются из стажа.
 */

export type ExcludedPeriod = {
  from: Date;
  to: Date;
  label?: string;
};

export type UnusedVacationInput = {
  /** Средний дневной заработок */
  avgDailyPay: number;
  /** Дата начала работы */
  startDate: Date;
  /** Дата окончания (увольнения или сегодня) */
  endDate: Date;
  /** Положенных дней отпуска в году (обычно 28) */
  annualVacationDays: number;
  /** Уже использованных дней отпуска */
  usedVacationDays: number;
  /** Исключаемые периоды (больничные, отпуск за свой счёт и т.д.) */
  excludedPeriods?: ExcludedPeriod[];
};

export type UnusedVacationResult = {
  /** Полных месяцев отработано (с учётом исключений) */
  workedMonths: number;
  /** Исключено дней */
  excludedDays: number;
  /** Положено дней за весь период */
  earnedDays: number;
  /** Неиспользовано дней */
  unusedDays: number;
  /** Сумма компенсации (до НДФЛ) */
  compensation: number;
  /** НДФЛ 13% */
  ndfl: number;
  /** На руки */
  netPay: number;
};

/** Кол-во полных месяцев между двумя датами (по ТК: остаток >=15 дней → +1 месяц) */
function calcWorkMonths(start: Date, end: Date, excludedDays: number): number {
  const totalMs = end.getTime() - start.getTime();
  const totalDays = Math.max(0, Math.floor(totalMs / 86400000) + 1 - excludedDays);
  const fullMonths = Math.floor(totalDays / 30.4);
  const remainder = totalDays % 30.4;
  return remainder >= 15 ? fullMonths + 1 : fullMonths;
}

function clampDays(period: ExcludedPeriod, start: Date, end: Date): number {
  const from = period.from < start ? start : period.from;
  const to = period.to > end ? end : period.to;
  if (to < from) return 0;
  return Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
}

export function calcUnusedVacation(input: UnusedVacationInput): UnusedVacationResult {
  const excluded = input.excludedPeriods ?? [];
  const excludedDays = excluded.reduce(
    (acc, p) => acc + clampDays(p, input.startDate, input.endDate),
    0,
  );

  const workedMonths = calcWorkMonths(input.startDate, input.endDate, excludedDays);

  // Если отработано 11+ месяцев в рабочем году — положен полный отпуск
  const effectiveMonths = workedMonths >= 11 ? 12 : workedMonths;
  const earnedDays = Math.round((effectiveMonths * input.annualVacationDays / 12) * 100) / 100;
  const unusedDays = Math.max(Math.round((earnedDays - input.usedVacationDays) * 100) / 100, 0);

  const compensation = Math.round(input.avgDailyPay * unusedDays * 100) / 100;
  const ndfl = Math.round(compensation * 0.13 * 100) / 100;
  const netPay = Math.round((compensation - ndfl) * 100) / 100;

  return { workedMonths, excludedDays, earnedDays, unusedDays, compensation, ndfl, netPay };
}
