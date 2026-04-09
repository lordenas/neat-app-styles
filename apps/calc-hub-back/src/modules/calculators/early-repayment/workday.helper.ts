/**
 * Проверка рабочего дня. Упрощённая версия: только суббота/воскресенье.
 * Для полного совпадения с РФ нужен производственный календарь (JSON).
 */
export function isWorkday(isoDate: string): boolean {
  const d = new Date(isoDate + 'T12:00:00.000Z');
  const day = d.getUTCDay();
  return day !== 0 && day !== 6;
}
