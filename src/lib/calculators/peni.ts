/**
 * Калькулятор пеней (налоги, ЖКХ, задержка зарплаты). Типы и константы для РФ.
 */

export type KeyRateEntry = {
  date: string;
  value: number;
};

export type KeyRateApiResponse = {
  updatedAt: string;
  rates: KeyRateEntry[];
};

export type PeniCalculationType = "tax" | "utilities" | "salary";
export type TaxPayerType = "individual" | "legal";

export const PENI_FRACTION_1_300 = 1 / 300;
export const PENI_FRACTION_1_150 = 1 / 150;
export const PENI_FRACTION_1_130 = 1 / 130;

export const SPECIAL_LEGAL_1_300_FROM = "2022-03-09";
export const SPECIAL_LEGAL_1_300_TO = "2023-12-31";

/** Получить ставку ЦБ на дату из массива ставок */
export function getKeyRateOnDate(rates: KeyRateEntry[], date: string): number {
  let rate = rates[0]?.value ?? 21;
  for (const entry of rates) {
    if (entry.date <= date) {
      rate = entry.value;
    } else {
      break;
    }
  }
  return rate;
}

/** Расчёт количества дней между двумя датами */
export function daysBetween(from: string, to: string): number {
  const d1 = new Date(from);
  const d2 = new Date(to);
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000));
}

/** Расчёт пеней за один день */
export function calculateDailyPeni(
  debt: number,
  keyRate: number,
  fraction: number,
): number {
  return debt * (keyRate / 100) * fraction;
}

/** Получить долю ключевой ставки для типа расчёта */
export function getPeniFraction(
  type: PeniCalculationType,
  payerType: TaxPayerType,
  daysOverdue: number,
): number {
  switch (type) {
    case "tax":
      if (payerType === "individual") return PENI_FRACTION_1_300;
      // Юрлица: первые 30 дней 1/300, далее 1/150
      return daysOverdue <= 30 ? PENI_FRACTION_1_300 : PENI_FRACTION_1_150;
    case "utilities":
      // ЖКХ: первые 30 дней — нет пеней, 31-90 — 1/300, с 91 — 1/130
      if (daysOverdue <= 30) return 0;
      if (daysOverdue <= 90) return PENI_FRACTION_1_300;
      return PENI_FRACTION_1_130;
    case "salary":
      return PENI_FRACTION_1_150;
    default:
      return PENI_FRACTION_1_300;
  }
}
