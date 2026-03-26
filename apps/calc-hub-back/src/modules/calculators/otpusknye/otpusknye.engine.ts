import type { OtpusknyeInput, OtpusknyeResult } from './otpusknye.types';

const AVG_DAYS_IN_MONTH = 29.3;

export function calcOtpusknye(input: OtpusknyeInput): OtpusknyeResult {
  let calcDays = input.fullMonths * AVG_DAYS_IN_MONTH;

  for (const pm of input.partialMonths) {
    const workedDays = pm.totalDaysInMonth - pm.excludedDays;
    calcDays += (AVG_DAYS_IN_MONTH / pm.totalDaysInMonth) * workedDays;
  }

  calcDays = Math.round(calcDays * 100) / 100;

  const avgDailyPay =
    calcDays > 0 ? Math.round((input.totalEarnings / calcDays) * 100) / 100 : 0;
  const vacationPay = Math.round(avgDailyPay * input.vacationDays * 100) / 100;
  const ndfl = Math.round(vacationPay * 0.13 * 100) / 100;
  const netPay = Math.round((vacationPay - ndfl) * 100) / 100;

  return { avgDailyPay, calcDays, vacationPay, ndfl, netPay };
}
