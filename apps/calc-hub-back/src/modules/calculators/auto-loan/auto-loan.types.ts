/**
 * Автокредит — типы входа/выхода расчёта аннуитетного платежа и графика.
 */

export interface AutoLoanInput {
  /** Стоимость автомобиля, руб. */
  carPrice: number;
  /** Первоначальный взнос, руб. */
  downPayment: number;
  /** Годовая процентная ставка, % */
  annualRate: number;
  /** Срок кредита, мес. */
  termMonths: number;
}

export interface AutoLoanRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface AutoLoanResult {
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AutoLoanRow[];
}
