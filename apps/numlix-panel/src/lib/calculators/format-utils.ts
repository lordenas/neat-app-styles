/** Форматирование числа для отображения в инпуте суммы (пробелы между разрядами). */
export function formatNumberInput(value: number): string {
  if (value === 0) return "";
  return new Intl.NumberFormat("ru-RU", { useGrouping: true }).format(value);
}

/** Парсинг строки инпута суммы в число (игнорируем пробелы и нецифры). */
export function parseNumberInput(s: string): number {
  const digits = s.replace(/\D/g, "");
  return digits === "" ? 0 : parseInt(digits, 10) || 0;
}
