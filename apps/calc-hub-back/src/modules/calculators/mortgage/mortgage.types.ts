export interface MortgageInput {
  propertyPrice: number;
  downPayment: number;
  annualRate: number;
  termYears: number;
}

export interface MortgageResult {
  principal: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  termMonths: number;
}
