/**
 * Производственный календарь РФ: нерабочие дни (праздники и переносы) и рабочие субботы/воскресенья.
 */

import { addDays, isBefore, parseISO, format } from "date-fns";

export type ProductionCalendarRu = {
  nonWorkdays: Record<string, string[]>;
  workingWeekendDays: Record<string, string[]>;
};

import calendarData from "@/data/production-calendar-ru.json";

const typedCalendar = calendarData as ProductionCalendarRu;

const nonWorkdaysByYear = typedCalendar.nonWorkdays;
const workingWeekendByYear = typedCalendar.workingWeekendDays;

function getYear(d: string): string {
  return d.slice(0, 4);
}

/** Проверка: дата — рабочий день (учитываются сб/вс и производственный календарь). */
export function isWorkday(dateStr: string): boolean {
  const year = getYear(dateStr);
  const workingWeekends = workingWeekendByYear[year];
  if (workingWeekends && workingWeekends.includes(dateStr)) return true;
  const nonWorkdays = nonWorkdaysByYear[year];
  if (nonWorkdays && nonWorkdays.includes(dateStr)) return false;
  const d = parseISO(dateStr);
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

/**
 * Возвращает список нерабочих праздничных дней, попадающих в отрезок [from, to] включительно.
 */
export function getHolidayDatesInRange(from: string, to: string): string[] {
  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  const result: string[] = [];
  const years = new Set<string>();
  let current = fromDate;
  while (isBefore(current, toDate) || current.getTime() === toDate.getTime()) {
    years.add(format(current, "yyyy"));
    current = addDays(current, 1);
  }
  for (const year of years) {
    const list = nonWorkdaysByYear[year];
    if (!list) continue;
    for (const d of list) {
      if (d >= from && d <= to) result.push(d);
    }
  }
  return result.sort();
}

/**
 * Подсчёт рабочих дней на отрезке [d1, d2): d1 включительно, d2 не включительно.
 */
export function getWorkdaysCount(d1: string, d2: string): number {
  const start = parseISO(d1);
  const end = parseISO(d2);
  if (!isBefore(start, end)) return 0;
  let count = 0;
  let current = start;
  while (isBefore(current, end)) {
    const dateStr = format(current, "yyyy-MM-dd");
    if (isWorkday(dateStr)) count++;
    current = addDays(current, 1);
  }
  return count;
}
