/**
 * Движок расчёта аннуитетных кредитов с досрочными погашениями.
 */

export type RepaymentMode = "reduce_term" | "reduce_payment";

export interface EarlyPaymentEntry {
  id: number;
  /** ISO date string or "" */
  date: string;
  amount: number;
  mode: RepaymentMode;
}

export interface ScheduleRow {
  n: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  early: number;
  balance: number;
}

export interface EarlyRepaymentResult {
  /** Base schedule (no early payments) */
  baseSchedule: ScheduleRow[];
  /** Schedule with early payments applied */
  schedule: ScheduleRow[];
  /** Monthly payment without early payments */
  baseMonthlyPayment: number;
  /** Last monthly payment after all early payments (reduce_payment mode) */
  finalMonthlyPayment: number;
  baseTotalInterest: number;
  totalInterest: number;
  baseTotalPayment: number;
  totalPayment: number;
  totalEarlyPaid: number;
  /** Original term in months */
  baseTermMonths: number;
  /** Actual term in months after early payments */
  actualTermMonths: number;
  interestSaved: number;
  termSavedMonths: number;
}

function annuityPayment(principal: number, rMonthly: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (rMonthly <= 0) return principal / termMonths;
  const factor = Math.pow(1 + rMonthly, termMonths);
  return (principal * rMonthly * factor) / (factor - 1);
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  // supports dd.mm.yyyy or ISO
  if (s.includes(".")) {
    const [dd, mm, yyyy] = s.split(".");
    return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** Build a base schedule (no early payments) */
function buildBaseSchedule(
  principal: number,
  rMonthly: number,
  termMonths: number,
  issueDate: Date,
): ScheduleRow[] {
  const mp = annuityPayment(principal, rMonthly, termMonths);
  const rows: ScheduleRow[] = [];
  let balance = principal;
  for (let i = 1; i <= termMonths && balance > 0.01; i++) {
    const interest = balance * rMonthly;
    const principalPaid = Math.min(mp - interest, balance);
    const payment = interest + principalPaid;
    balance = Math.max(0, balance - principalPaid);
    rows.push({
      n: i,
      date: formatDate(addMonths(issueDate, i)),
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      early: 0,
      balance: Math.round(balance * 100) / 100,
    });
  }
  return rows;
}

export function calculateEarlyRepayment(
  loanAmount: number,
  annualRatePercent: number,
  termMonths: number,
  issueDate: Date,
  earlyPayments: EarlyPaymentEntry[],
): EarlyRepaymentResult {
  const rMonthly = annualRatePercent / 100 / 12;

  // --- Base schedule ---
  const baseSchedule = buildBaseSchedule(loanAmount, rMonthly, termMonths, issueDate);
  const baseMonthlyPayment = annuityPayment(loanAmount, rMonthly, termMonths);
  const baseTotalInterest = baseSchedule.reduce((s, r) => s + r.interest, 0);
  const baseTotalPayment = baseSchedule.reduce((s, r) => s + r.payment, 0);

  // --- Schedule with early payments ---
  // Sort early payments by date
  const sorted = [...earlyPayments]
    .filter((ep) => ep.amount > 0 && ep.date)
    .sort((a, b) => {
      const da = parseDate(a.date);
      const db = parseDate(b.date);
      return (da?.getTime() ?? 0) - (db?.getTime() ?? 0);
    });

  const rows: ScheduleRow[] = [];
  let balance = loanAmount;
  let currentPayment = annuityPayment(loanAmount, rMonthly, termMonths);
  let remainingTermMonths = termMonths;
  let monthIndex = 0;
  let totalEarlyPaid = 0;

  while (balance > 0.01 && monthIndex < termMonths * 2) {
    monthIndex++;
    const paymentDate = addMonths(issueDate, monthIndex);

    // Collect early payments due this month or earlier
    let earlyThisMonth = 0;
    let modeThisMonth: RepaymentMode = "reduce_term";
    for (const ep of sorted) {
      const epDate = parseDate(ep.date);
      if (!epDate) continue;
      // Apply if payment date falls within this month
      if (epDate <= paymentDate && !rows.some((r) => r.early > 0 && r.date === formatDate(paymentDate))) {
        // Check if we haven't applied this ep yet
        const alreadyApplied = rows.reduce((s, r) => s + r.early, 0) >= totalEarlyPaid + ep.amount;
        if (!alreadyApplied && epDate > addMonths(issueDate, monthIndex - 1)) {
          earlyThisMonth += ep.amount;
          modeThisMonth = ep.mode;
        }
      }
    }

    const interest = balance * rMonthly;
    const principalFromPayment = Math.min(currentPayment - interest, balance);
    const actualPayment = interest + principalFromPayment;

    balance = Math.max(0, balance - principalFromPayment);

    // Apply early payment
    const actualEarly = Math.min(earlyThisMonth, balance);
    balance = Math.max(0, balance - actualEarly);
    totalEarlyPaid += actualEarly;

    rows.push({
      n: monthIndex,
      date: formatDate(paymentDate),
      payment: Math.round(actualPayment * 100) / 100,
      principal: Math.round(principalFromPayment * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      early: Math.round(actualEarly * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });

    if (balance < 0.01) break;

    // Recalculate after early payment
    if (actualEarly > 0) {
      remainingTermMonths = termMonths - monthIndex;
      if (modeThisMonth === "reduce_payment" && remainingTermMonths > 0) {
        currentPayment = annuityPayment(balance, rMonthly, remainingTermMonths);
      }
      // reduce_term: keep same payment, term naturally shrinks
    }
  }

  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPayment = rows.reduce((s, r) => s + r.payment, 0);
  const actualTermMonths = rows.length;
  const finalMonthlyPayment = rows.length > 0 ? rows[rows.length - 1].payment : currentPayment;

  return {
    baseSchedule,
    schedule: rows,
    baseMonthlyPayment: Math.round(baseMonthlyPayment * 100) / 100,
    finalMonthlyPayment: Math.round(finalMonthlyPayment * 100) / 100,
    baseTotalInterest: Math.round(baseTotalInterest * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    baseTotalPayment: Math.round(baseTotalPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalEarlyPaid: Math.round(totalEarlyPaid * 100) / 100,
    baseTermMonths: termMonths,
    actualTermMonths,
    interestSaved: Math.round((baseTotalInterest - totalInterest) * 100) / 100,
    termSavedMonths: Math.max(0, termMonths - actualTermMonths),
  };
}
