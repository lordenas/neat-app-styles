import type { MortgageInput, MortgageResult } from './mortgage.types';

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

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const { propertyPrice, downPayment, annualRate, termYears } = input;
  const principal = propertyPrice - downPayment;
  const termMonths = termYears * 12;
  const monthlyPayment = annuityMonthlyPayment(
    principal,
    annualRate,
    termMonths,
  );
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
