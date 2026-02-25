/**
 * Auto Loan Calculator — annuity payments with schedule.
 */

export type AutoLoanInput = {
  /** Vehicle price */
  carPrice: number;
  /** Down payment */
  downPayment: number;
  /** Annual interest rate (%) */
  annualRate: number;
  /** Loan term (months) */
  termMonths: number;
};

export type AutoLoanRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type AutoLoanResult = {
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AutoLoanRow[];
};

export function calcAutoLoan(input: AutoLoanInput): AutoLoanResult {
  const loanAmount = Math.max(input.carPrice - input.downPayment, 0);
  if (loanAmount === 0 || input.termMonths <= 0) {
    return { loanAmount: 0, monthlyPayment: 0, totalPayment: 0, totalInterest: 0, schedule: [] };
  }

  const r = input.annualRate / 100 / 12;
  let monthlyPayment: number;

  if (r === 0) {
    monthlyPayment = loanAmount / input.termMonths;
  } else {
    monthlyPayment = loanAmount * (r * Math.pow(1 + r, input.termMonths)) / (Math.pow(1 + r, input.termMonths) - 1);
  }

  monthlyPayment = Math.round(monthlyPayment * 100) / 100;

  const schedule: AutoLoanRow[] = [];
  let balance = loanAmount;

  for (let m = 1; m <= input.termMonths; m++) {
    const interest = Math.round(balance * r * 100) / 100;
    const principal = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(balance - principal, 0);
    schedule.push({ month: m, payment: monthlyPayment, principal, interest, balance });
  }

  const totalPayment = Math.round(monthlyPayment * input.termMonths * 100) / 100;
  const totalInterest = Math.round((totalPayment - loanAmount) * 100) / 100;

  return { loanAmount, monthlyPayment, totalPayment, totalInterest, schedule };
}
