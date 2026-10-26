import { addDays, addMonths, dateOnly, formatDate, parseDate, parseRange } from './calendar-date';

describe('Gregorian date-only values', () => {
  it('rejects impossible dates without JavaScript rollover and accepts Gregorian leap years', () => {
    for (const text of [
      '31/02/2026',
      '29/02/1900',
      '00/01/2026',
      '01/13/2026',
      '2026-05-23',
      '1/5/2026',
      '01/01/0000',
    ])
      expect(parseDate(text)).toBeNull();
    for (const text of ['29/02/2000', '29/02/2024', '01/01/0001', '31/12/9999'])
      expect(formatDate(parseDate(text)!)).toBe(text);
  });
  it('moves across leap days, month ends, year ends and DST dates without changing date meaning', () => {
    expect(formatDate(addDays(parseDate('28/02/2024')!, 1))).toBe('29/02/2024');
    expect(formatDate(addDays(parseDate('31/12/2026')!, 1))).toBe('01/01/2027');
    expect(formatDate(addDays(parseDate('29/03/2026')!, 1))).toBe('30/03/2026');
    expect(formatDate(addMonths(parseDate('31/01/2026')!, 1))).toBe('28/02/2026');
    expect(formatDate(dateOnly(2026, 4, 23))).toBe('23/05/2026');
  });
  it('parses both supported range separators and leaves order validation explicit', () => {
    expect(parseRange('18/05/2026 – 23/05/2026')?.end).toEqual(parseDate('23/05/2026'));
    expect(parseRange('18/05/2026 - 18/05/2026')?.start).toEqual(parseDate('18/05/2026'));
    expect(parseRange('31/02/2026 – 23/05/2026')).toBeNull();
    const reversed = parseRange('23/05/2026 – 18/05/2026')!;
    expect(reversed.end < reversed.start).toBe(true);
  });
});
