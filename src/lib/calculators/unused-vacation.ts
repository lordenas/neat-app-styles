/**
 * Калькулятор компенсации за неиспользованный отпуск при увольнении (ТК РФ).
 *
 * Дни компенсации = (Отработанные месяцы × Дней отпуска в году / 12) − Использованные дни
 * Компенсация = СДЗ × Дни компенсации
 */

export type UnusedVacationInput = {
  /** Средний дневной заработок (или суммарный заработок за 12 мес. — будет пересчитан) */
  avgDailyPay: number;
  /** Количество полных месяцев работы */
  workedMonths: number;
  /** Положенных дней отпуска в году (обычно 28) */
  annualVacationDays: number;
  /** Уже использованных дней отпуска */
  usedVacationDays: number;
};

export type UnusedVacationResult = {
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

export function calcUnusedVacation(input: UnusedVacationInput): UnusedVacationResult {
  // Если отработано 11+ месяцев в рабочем году — положен полный отпуск
  const effectiveMonths = input.workedMonths >= 11 ? 12 : input.workedMonths;
  const earnedDays = Math.round((effectiveMonths * input.annualVacationDays / 12) * 100) / 100;
  const unusedDays = Math.max(Math.round((earnedDays - input.usedVacationDays) * 100) / 100, 0);

  const compensation = Math.round(input.avgDailyPay * unusedDays * 100) / 100;
  const ndfl = Math.round(compensation * 0.13 * 100) / 100;
  const netPay = Math.round((compensation - ndfl) * 100) / 100;

  return { earnedDays, unusedDays, compensation, ndfl, netPay };
}
