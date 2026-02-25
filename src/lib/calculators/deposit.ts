/**
 * Калькулятор вкладов.
 *
 * Поддержка:
 * - Капитализация (ежемесячная, ежеквартальная, в конце срока)
 * - Регулярные пополнения
 * - Регулярные снятия (частичные)
 * - Налог на доход по вкладу (с 2023: превышение необлагаемого порога = 1 млн × макс. ключевая ставка ЦБ)
 */

export type CapitalizationType = "monthly" | "quarterly" | "endOfTerm" | "none";

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
};

export type DepositMonthRow = {
  month: number;
  /** Баланс на начало месяца */
  openBalance: number;
  /** Начисленные проценты за месяц */
  interest: number;
  /** Пополнение */
  topUp: number;
  /** Снятие */
  withdrawal: number;
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
  /** Всего пополнений */
  totalTopUps: number;
  /** Всего снятий */
  totalWithdrawals: number;
  /** Необлагаемый порог дохода */
  taxFreeThreshold: number;
  /** Налогооблагаемый доход */
  taxableIncome: number;
  /** Налог (13%) */
  tax: number;
  /** Чистый доход (проценты − налог) */
  netIncome: number;
  /** Эффективная ставка (% годовых) */
  effectiveRate: number;
  /** Помесячная таблица */
  schedule: DepositMonthRow[];
};

export function calcDeposit(input: DepositInput): DepositResult {
  const { initialAmount, annualRate, termMonths, capitalization, monthlyTopUp, monthlyWithdrawal, maxKeyRate } = input;

  const monthlyRate = annualRate / 100 / 12;
  const schedule: DepositMonthRow[] = [];

  let balance = initialAmount;
  let totalInterest = 0;
  let totalTopUps = 0;
  let totalWithdrawals = 0;
  let accruedInterest = 0; // для капитализации "в конце срока"

  // Определяем, когда капитализировать
  const shouldCapitalize = (month: number, isLast: boolean): boolean => {
    if (capitalization === "none") return false;
    if (capitalization === "monthly") return true;
    if (capitalization === "quarterly") return month % 3 === 0;
    if (capitalization === "endOfTerm") return isLast;
    return false;
  };

  for (let m = 1; m <= termMonths; m++) {
    const openBalance = balance;
    const effectiveBalance = capitalization === "endOfTerm" ? balance : balance;
    const interest = Math.round(effectiveBalance * monthlyRate * 100) / 100;

    totalInterest += interest;
    accruedInterest += interest;

    const isLast = m === termMonths;

    if (shouldCapitalize(m, isLast)) {
      balance += accruedInterest;
      accruedInterest = 0;
    }

    // Пополнение
    const topUp = monthlyTopUp;
    balance += topUp;
    totalTopUps += topUp;

    // Снятие (не больше баланса, оставляем минимум 0)
    const withdrawal = Math.min(monthlyWithdrawal, Math.max(balance - 1, 0));
    balance -= withdrawal;
    totalWithdrawals += withdrawal;

    schedule.push({
      month: m,
      openBalance,
      interest,
      topUp,
      withdrawal,
      closeBalance: Math.round(balance * 100) / 100,
      accruedInterest: Math.round(accruedInterest * 100) / 100,
    });
  }

  // Если остались некапитализированные проценты (capitalization === "none")
  const finalAmount = Math.round((balance + accruedInterest) * 100) / 100;
  totalInterest = Math.round(totalInterest * 100) / 100;

  // Налог на доход по вкладу
  const taxFreeThreshold = Math.round(1_000_000 * maxKeyRate / 100);
  const taxableIncome = Math.max(totalInterest - taxFreeThreshold, 0);
  const tax = Math.round(taxableIncome * 0.13);
  const netIncome = Math.round((totalInterest - tax) * 100) / 100;

  // Эффективная ставка
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
