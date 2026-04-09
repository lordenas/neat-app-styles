/** Minimal date helpers for penalty-contract engine (no date-fns). */

export function parseISO(str: string): Date {
  const d = new Date(str + 'T00:00:00');
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

export function differenceInCalendarDays(a: Date, b: Date): number {
  const t0 = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const t1 = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((t1 - t0) / 86400000);
}

export function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}

/** Format as dd.MM.yyyy */
export function formatRu(d: Date): string {
  const day = `${d.getDate()}`.padStart(2, '0');
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}
