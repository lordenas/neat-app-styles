/**
 * Расчёт ипотеки и рефинансирования: аннуитетные платежи, график погашения.
 */

export type TermUnit = "years" | "months";

export type SchedulePeriod = "year" | "month";

export type RefinancingInput = {
  remainingDebt: number;
  remainingTerm: number;
  termUnit: TermUnit;
  currentRate: number;
  newAmount?: number;
  newTerm?: number;
  newTermUnit?: TermUnit;
  newRate?: number;
  amountChanged: boolean;
  termChanged: boolean;
  rateChanged: boolean;
};

export type RefinancingResult = {
  currentMonthlyPayment: number;
  currentTotalInterest: number;
  currentTotalPayment: number;
  refinancedMonthlyPayment: number;
  refinancedTotalInterest: number;
  refinancedTotalPayment: number;
  monthlyPaymentDelta: number;
  totalInterestDelta: number;
  effectivePrincipal: number;
  effectiveTermMonths: number;
  effectiveRate: number;
};

export type RefinancingScheduleRow = {
  year: number;
  month?: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type RefinancingChartData = {
  year: number;
  paid: number;
  interest: number;
  balance: number;
};

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

export function calculateRefinancing(input: RefinancingInput): RefinancingResult {
  const termMonths = input.termUnit === "years" ? input.remainingTerm * 12 : input.remainingTerm;

  const currentMonthly = annuityMonthlyPayment(input.remainingDebt, input.currentRate, termMonths);
  const currentTotalPayment = currentMonthly * termMonths;
  const currentTotalInterest = Math.max(0, currentTotalPayment - input.remainingDebt);

  const effectivePrincipal = input.amountChanged && input.newAmount != null ? input.newAmount : input.remainingDebt;
  const effectiveTermMonths = input.termChanged && input.newTerm != null && input.newTermUnit != null
    ? input.newTermUnit === "years" ? input.newTerm * 12 : input.newTerm
    : termMonths;
  const effectiveRate = input.rateChanged && input.newRate != null ? input.newRate : input.currentRate;

  const refinancedMonthly = annuityMonthlyPayment(effectivePrincipal, effectiveRate, effectiveTermMonths);
  const refinancedTotalPayment = refinancedMonthly * effectiveTermMonths;
  const refinancedTotalInterest = Math.max(0, refinancedTotalPayment - effectivePrincipal);

  return {
    currentMonthlyPayment: currentMonthly,
    currentTotalInterest,
    currentTotalPayment,
    refinancedMonthlyPayment: refinancedMonthly,
    refinancedTotalInterest,
    refinancedTotalPayment,
    monthlyPaymentDelta: refinancedMonthly - currentMonthly,
    totalInterestDelta: refinancedTotalInterest - currentTotalInterest,
    effectivePrincipal,
    effectiveTermMonths,
    effectiveRate,
  };
}

export function buildRefinancingSchedule(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
  period: SchedulePeriod = "year",
): { rows: RefinancingScheduleRow[]; chartData: RefinancingChartData[] } {
  const monthlyPayment = annuityMonthlyPayment(principal, annualRatePercent, termMonths);
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

    if (period === "month") {
      const yearNum = Math.ceil(month / 12);
      const monthInYear = ((month - 1) % 12) + 1;
      rows.push({
        year: yearNum, month: monthInYear,
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
      if (period === "year") {
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

/** Simple mortgage calculation (wrapper) */
export function calculateMortgage(
  propertyPrice: number,
  downPayment: number,
  annualRate: number,
  termYears: number,
) {
  const principal = propertyPrice - downPayment;
  const termMonths = termYears * 12;
  const monthlyPayment = annuityMonthlyPayment(principal, annualRate, termMonths);
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = Math.max(0, totalPayment - principal);

  return {
    principal,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    termMonths,
  };
}
