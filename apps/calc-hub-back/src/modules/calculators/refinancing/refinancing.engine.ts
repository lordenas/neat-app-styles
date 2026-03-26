import type {
  RefinancingInput,
  RefinancingResult,
  RefinancingScheduleRow,
  RefinancingChartData,
  SchedulePeriod,
} from './refinancing.types';

function annuityMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r <= 0) return principal / termMonths;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}

export function calculateRefinancing(
  input: RefinancingInput,
): RefinancingResult {
  const termMonths =
    input.termUnit === 'years' ? input.remainingTerm * 12 : input.remainingTerm;

  const currentMonthly = annuityMonthlyPayment(
    input.remainingDebt,
    input.currentRate,
    termMonths,
  );
  const currentTotalPayment = currentMonthly * termMonths;
  const currentTotalInterest = Math.max(
    0,
    currentTotalPayment - input.remainingDebt,
  );

  const effectivePrincipal =
    input.amountChanged && input.newAmount != null
      ? input.newAmount
      : input.remainingDebt;
  const effectiveTermMonths =
    input.termChanged && input.newTerm != null && input.newTermUnit != null
      ? input.newTermUnit === 'years'
        ? input.newTerm * 12
        : input.newTerm
      : termMonths;
  const effectiveRate =
    input.rateChanged && input.newRate != null
      ? input.newRate
      : input.currentRate;

  const refinancedMonthly = annuityMonthlyPayment(
    effectivePrincipal,
    effectiveRate,
    effectiveTermMonths,
  );
  const refinancedTotalPayment = refinancedMonthly * effectiveTermMonths;
  const refinancedTotalInterest = Math.max(
    0,
    refinancedTotalPayment - effectivePrincipal,
  );

  return {
    currentMonthlyPayment: Math.round(currentMonthly * 100) / 100,
    currentTotalInterest: Math.round(currentTotalInterest * 100) / 100,
    currentTotalPayment: Math.round(currentTotalPayment * 100) / 100,
    refinancedMonthlyPayment: Math.round(refinancedMonthly * 100) / 100,
    refinancedTotalInterest: Math.round(refinancedTotalInterest * 100) / 100,
    refinancedTotalPayment: Math.round(refinancedTotalPayment * 100) / 100,
    monthlyPaymentDelta:
      Math.round((refinancedMonthly - currentMonthly) * 100) / 100,
    totalInterestDelta:
      Math.round((refinancedTotalInterest - currentTotalInterest) * 100) / 100,
    effectivePrincipal,
    effectiveTermMonths,
    effectiveRate,
  };
}

export function buildRefinancingSchedule(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
  period: SchedulePeriod = 'year',
): { rows: RefinancingScheduleRow[]; chartData: RefinancingChartData[] } {
  const monthlyPayment = annuityMonthlyPayment(
    principal,
    annualRatePercent,
    termMonths,
  );
  const r = annualRatePercent / 100 / 12;
  const rows: RefinancingScheduleRow[] = [];
  const chartData: RefinancingChartData[] = [];
  let balance = principal;
  let year = 1;
  let yearPayment = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;

  for (let month = 1; month <= termMonths && balance > 0; month++) {
    const interest = balance * r;
    const principalPaid = Math.min(monthlyPayment - interest, balance);
    const payment = interest + principalPaid;
    balance = Math.max(0, balance - principalPaid);
    yearPayment += payment;
    yearPrincipal += principalPaid;
    yearInterest += interest;

    if (period === 'month') {
      const yearNum = Math.ceil(month / 12);
      const monthInYear = ((month - 1) % 12) + 1;
      rows.push({
        year: yearNum,
        month: monthInYear,
        payment: Math.round(payment * 100) / 100,
        principal: Math.round(principalPaid * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        balance: Math.round(balance * 100) / 100,
      });
      chartData.push({
        year: month,
        paid: Math.round(principalPaid * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        balance: Math.round(balance * 100) / 100,
      });
    }

    if (month % 12 === 0 || month === termMonths) {
      if (period === 'year') {
        rows.push({
          year,
          payment: Math.round(yearPayment * 100) / 100,
          principal: Math.round(yearPrincipal * 100) / 100,
          interest: Math.round(yearInterest * 100) / 100,
          balance: Math.round(balance * 100) / 100,
        });
        chartData.push({
          year,
          paid: Math.round(yearPrincipal * 100) / 100,
          interest: Math.round(yearInterest * 100) / 100,
          balance: Math.round(balance * 100) / 100,
        });
      }
      year++;
      yearPayment = 0;
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  return { rows, chartData };
}
