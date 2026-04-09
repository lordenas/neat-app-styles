import * as path from 'path';
import * as fs from 'fs';
import {
  addDays,
  formatYmd,
  isBefore,
  parseISO,
} from './penalty-contract.date';

export interface ProductionCalendarRu {
  nonWorkdays: Record<string, string[]>;
  workingWeekendDays: Record<string, string[]>;
}

let cachedCalendar: ProductionCalendarRu | null = null;

function loadCalendar(): ProductionCalendarRu {
  if (cachedCalendar) return cachedCalendar;
  const jsonPath = path.join(
    process.cwd(),
    'dist',
    'data',
    'production-calendar-ru.json',
  );
  const fallbackPath = path.join(
    process.cwd(),
    'src',
    'data',
    'production-calendar-ru.json',
  );
  let data: string;
  try {
    data = fs.readFileSync(jsonPath, 'utf-8');
  } catch {
    data = fs.readFileSync(fallbackPath, 'utf-8');
  }
  cachedCalendar = JSON.parse(data) as ProductionCalendarRu;
  return cachedCalendar;
}

function getYear(d: string): string {
  return d.slice(0, 4);
}

export function isWorkday(dateStr: string): boolean {
  const cal = loadCalendar();
  const year = getYear(dateStr);
  const workingWeekends = cal.workingWeekendDays[year];
  if (workingWeekends?.includes(dateStr)) return true;
  const nonWorkdays = cal.nonWorkdays[year];
  if (nonWorkdays?.includes(dateStr)) return false;
  const d = parseISO(dateStr);
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

/** Workdays count on segment [d1, d2): d1 inclusive, d2 exclusive. */
export function getWorkdaysCount(d1: string, d2: string): number {
  const start = parseISO(d1);
  const end = parseISO(d2);
  if (!isBefore(start, end)) return 0;
  let count = 0;
  let current = start;
  while (isBefore(current, end)) {
    const dateStr = formatYmd(current);
    if (isWorkday(dateStr)) count++;
    current = addDays(current, 1);
  }
  return count;
}
