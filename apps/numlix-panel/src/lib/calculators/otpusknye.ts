/**
 * Калькулятор отпускных по ТК РФ (ПП 922).
 *
 * Средний дневной заработок = СуммаЗаработка / (ПолныеМесяцы × 29.3 + ДниВНеполныхМесяцах × 29.3/ДнейВМесяце)
 * Отпускные = СДЗ × ДниОтпуска
 */

export type ExcludedPeriod = {
  /** Количество календарных дней, пропущенных в данном месяце расчётного периода */
  excludedDays: number;
  /** Общее количество календарных дней в этом месяце */
  totalDaysInMonth: number;
};

export type OtpusknyeInput = {
  /** Суммарный заработок за расчётный период (12 мес.) */
  totalEarnings: number;
  /** Количество полных отработанных месяцев (0-12) */
  fullMonths: number;
  /** Неполные месяцы с исключёнными периодами */
  partialMonths: ExcludedPeriod[];
  /** Количество дней отпуска */
  vacationDays: number;
};

export type OtpusknyeResult = {
  /** Средний дневной заработок */
  avgDailyPay: number;
  /** Количество расчётных дней */
  calcDays: number;
  /** Сумма отпускных (до НДФЛ) */
  vacationPay: number;
  /** НДФЛ 13% */
  ndfl: number;
  /** На руки */
  netPay: number;
};

const AVG_DAYS_IN_MONTH = 29.3;

export function calcOtpusknye(input: OtpusknyeInput): OtpusknyeResult {
  // Расчётные дни в полных месяцах
  let calcDays = input.fullMonths * AVG_DAYS_IN_MONTH;

  // Расчётные дни в неполных месяцах
  for (const pm of input.partialMonths) {
    const workedDays = pm.totalDaysInMonth - pm.excludedDays;
    calcDays += (AVG_DAYS_IN_MONTH / pm.totalDaysInMonth) * workedDays;
  }

  calcDays = Math.round(calcDays * 100) / 100;

  const avgDailyPay = calcDays > 0 ? Math.round((input.totalEarnings / calcDays) * 100) / 100 : 0;
  const vacationPay = Math.round(avgDailyPay * input.vacationDays * 100) / 100;
  const ndfl = Math.round(vacationPay * 0.13 * 100) / 100;
  const netPay = Math.round((vacationPay - ndfl) * 100) / 100;

  return { avgDailyPay, calcDays, vacationPay, ndfl, netPay };
}
