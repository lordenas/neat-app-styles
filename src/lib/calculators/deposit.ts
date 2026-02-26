/**
 * Калькулятор вкладов.
 *
 * Поддержка:
 * - Капитализация (ежемесячная, ежеквартальная, в конце срока, без)
 * - Регулярные и разовые пополнения
 * - Регулярные и разовые снятия
 * - Налог на доход по вкладу (ключевая ставка ЦБ × 1 000 000 = порог)
 * - Кастомная ставка НДФЛ
 */

export type CapitalizationType = "monthly" | "quarterly" | "endOfTerm" | "none";

/** Разовое пополнение/снятие в конкретный месяц */
export type OneTimeTransaction = {
  /** Номер месяца (1-based) */
  month: number;
  /** Сумма */
  amount: number;
};

export type DepositInput = {
  /** Начальная сумма вклада */
  initialAmount: number;
  /** Годовая процентная ставка (%) */
  annualRate: number;
  /** Срок вклада (месяцев) */
  termMonths: number;
  /** Тип капитализации */
  capitalization: CapitalizationType;
  /** Ежемесячное пополнение */
  monthlyTopUp: number;
  /** Ежемесячное снятие */
  monthlyWithdrawal: number;
  /** Максимальная ключевая ставка ЦБ за год (для расчёта налога) */
  maxKeyRate: number;
  /** Ставка НДФЛ (%) — по умолчанию 13 */
  ndflRate?: number;
  /** Разовые пополнения */
  oneTimeTopUps?: OneTimeTransaction[];
  /** Разовые снятия */
  oneTimeWithdrawals?: OneTimeTransaction[];
};

export type DepositMonthRow = {
  month: number;
  /** Баланс на начало месяца */
  openBalance: number;
  /** Начисленные проценты за месяц */
  interest: number;
  /** Регулярное пополнение */
  topUp: number;
  /** Разовое пополнение */
  oneTimeTopUp: number;
  /** Регулярное снятие */
  withdrawal: number;
  /** Разовое снятие */
  oneTimeWithdrawal: number;
  /** Баланс на конец месяца */
  closeBalance: number;
  /** Накопленные проценты (для капитализации "в конце") */
  accruedInterest: number;
};

export type DepositResult = {
  /** Итоговая сумма на конец срока */
  finalAmount: number;
  /** Всего начислено процентов */
  totalInterest: number;
  /** Всего пополнений (регулярные + разовые) */
  totalTopUps: number;
  /** Всего снятий (регулярные + разовые) */
  totalWithdrawals: number;
  /** Необлагаемый порог дохода */
  taxFreeThreshold: number;
  /** Налогооблагаемый доход */
  taxableIncome: number;
  /** Налог */
  tax: number;
  /** Чистый доход (проценты − налог) */
  netIncome: number;
  /** Эффективная ставка (% годовых) */
  effectiveRate: number;
  /** Помесячная таблица */
  schedule: DepositMonthRow[];
};

export function calcDeposit(input: DepositInput): DepositResult {
  const {
    initialAmount, annualRate, termMonths, capitalization,
    monthlyTopUp, monthlyWithdrawal, maxKeyRate,
    ndflRate = 13,
    oneTimeTopUps = [],
    oneTimeWithdrawals = [],
  } = input;

  const monthlyRate = annualRate / 100 / 12;
  const schedule: DepositMonthRow[] = [];

  let balance = initialAmount;
  let totalInterest = 0;
  let totalTopUps = 0;
  let totalWithdrawals = 0;
  let accruedInterest = 0;

  const shouldCapitalize = (month: number, isLast: boolean): boolean => {
    if (capitalization === "none") return false;
    if (capitalization === "monthly") return true;
    if (capitalization === "quarterly") return month % 3 === 0;
    if (capitalization === "endOfTerm") return isLast;
    return false;
  };

  for (let m = 1; m <= termMonths; m++) {
    const openBalance = balance;
    const interest = Math.round(balance * monthlyRate * 100) / 100;

    totalInterest += interest;
    accruedInterest += interest;

    const isLast = m === termMonths;
    if (shouldCapitalize(m, isLast)) {
      balance += accruedInterest;
      accruedInterest = 0;
    }

    // Регулярное пополнение
    const topUp = monthlyTopUp;
    balance += topUp;
    totalTopUps += topUp;

    // Разовое пополнение
    const oneTimeTopUp = oneTimeTopUps.filter((t) => t.month === m).reduce((s, t) => s + t.amount, 0);
    balance += oneTimeTopUp;
    totalTopUps += oneTimeTopUp;

    // Регулярное снятие
    const withdrawal = Math.min(monthlyWithdrawal, Math.max(balance - 1, 0));
    balance -= withdrawal;
    totalWithdrawals += withdrawal;

    // Разовое снятие
    const oneTimeWithdrawalAmt = oneTimeWithdrawals.filter((t) => t.month === m).reduce((s, t) => s + t.amount, 0);
    const actualOneTimeWithdrawal = Math.min(oneTimeWithdrawalAmt, Math.max(balance - 1, 0));
    balance -= actualOneTimeWithdrawal;
    totalWithdrawals += actualOneTimeWithdrawal;

    schedule.push({
      month: m,
      openBalance,
      interest,
      topUp,
      oneTimeTopUp,
      withdrawal,
      oneTimeWithdrawal: actualOneTimeWithdrawal,
      closeBalance: Math.round(balance * 100) / 100,
      accruedInterest: Math.round(accruedInterest * 100) / 100,
    });
  }

  const finalAmount = Math.round((balance + accruedInterest) * 100) / 100;
  totalInterest = Math.round(totalInterest * 100) / 100;

  const taxFreeThreshold = Math.round(1_000_000 * maxKeyRate / 100);
  const taxableIncome = Math.max(totalInterest - taxFreeThreshold, 0);
  const tax = Math.round(taxableIncome * (ndflRate / 100));
  const netIncome = Math.round((totalInterest - tax) * 100) / 100;

  const years = termMonths / 12;
  const effectiveRate = initialAmount > 0 && years > 0
    ? Math.round((totalInterest / initialAmount / years) * 100 * 100) / 100
    : 0;

  return {
    finalAmount,
    totalInterest,
    totalTopUps,
    totalWithdrawals,
    taxFreeThreshold,
    taxableIncome,
    tax,
    netIncome,
    effectiveRate,
    schedule,
  };
}
