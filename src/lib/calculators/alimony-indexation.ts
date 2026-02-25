/**
 * Калькулятор индексации алиментов (ст. 117 СК РФ).
 *
 * Размер алиментов пропорционально увеличивается при росте прожиточного минимума:
 * Новая сумма = Старая сумма × (Новый ПМ / Старый ПМ)
 *
 * Исторические данные ПМ на ребёнка по РФ (в целом) с 2011 года.
 */

export type AlimonyIndexationInput = {
  /** Установленная судом сумма алиментов (руб.) */
  originalAmount: number;
  /** ПМ на момент установления (руб.) — или выбор из исторических */
  originalPm: number;
  /** Текущий ПМ (руб.) — или выбор из исторических */
  currentPm: number;
};

export type AlimonyIndexationResult = {
  /** Индексированная сумма */
  indexedAmount: number;
  /** Коэффициент индексации */
  indexCoefficient: number;
  /** Разница */
  difference: number;
};

export function calcAlimonyIndexation(input: AlimonyIndexationInput): AlimonyIndexationResult {
  if (input.originalPm <= 0) {
    return { indexedAmount: input.originalAmount, indexCoefficient: 1, difference: 0 };
  }

  const indexCoefficient = Math.round((input.currentPm / input.originalPm) * 10000) / 10000;
  const indexedAmount = Math.round(input.originalAmount * indexCoefficient * 100) / 100;
  const difference = Math.round((indexedAmount - input.originalAmount) * 100) / 100;

  return { indexedAmount, indexCoefficient, difference };
}

/** Исторические значения ПМ на ребёнка по РФ (на начало периода) */
export const PM_CHILD_HISTORY: { period: string; value: number }[] = [
  { period: "01.01.2025", value: 15869 },
  { period: "01.01.2024", value: 14989 },
  { period: "01.01.2023", value: 13944 },
  { period: "01.06.2022", value: 13501 },
  { period: "01.01.2022", value: 12274 },
  { period: "01.01.2021", value: 11303 },
  { period: "01.01.2020", value: 11004 },
  { period: "01.01.2019", value: 10585 },
  { period: "01.01.2018", value: 10181 },
  { period: "01.01.2017", value: 9756 },
  { period: "01.01.2016", value: 9677 },
  { period: "01.01.2015", value: 9197 },
  { period: "01.01.2014", value: 7452 },
  { period: "01.01.2013", value: 6717 },
  { period: "01.01.2012", value: 6259 },
  { period: "01.12.2011", value: 6157 },
];
