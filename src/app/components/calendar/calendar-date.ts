/** Gregorian date-only helpers. UTC arithmetic avoids DST and timestamp parsing surprises. */
export function dateOnly(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  return date;
}

export function parseDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match.map(Number);
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = dateOnly(year, month - 1, day);
  return date.getUTCDate() === day && date.getUTCMonth() === month - 1 ? date : null;
}

export function formatDate(date: Date): string {
  return `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCFullYear()).padStart(4, '0')}`;
}

export function localToday(): Date {
  const now = new Date();
  return dateOnly(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  return dateOnly(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days);
}

export function addMonths(date: Date, months: number): Date {
  const first = dateOnly(date.getUTCFullYear(), date.getUTCMonth() + months, 1);
  const last = dateOnly(first.getUTCFullYear(), first.getUTCMonth() + 1, 0).getUTCDate();
  return dateOnly(first.getUTCFullYear(), first.getUTCMonth(), Math.min(last, date.getUTCDate()));
}

export function parseRange(value: string): { start: Date; end: Date } | null {
  const parts = value.split(/\s+[–-]\s+/);
  if (parts.length !== 2) return null;
  const start = parseDate(parts[0]);
  const end = parseDate(parts[1]);
  return start && end ? { start, end } : null;
}
