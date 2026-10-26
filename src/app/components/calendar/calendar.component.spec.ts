import { TestBed } from '@angular/core/testing';
import { userEvent } from 'storybook/test';
import { CalendarComponent } from './calendar.component';
import { parseDate } from './calendar-date';

describe('Calendar selection and keyboard model', () => {
  afterEach(() => vi.useRealTimers());
  async function setup(mode: 'single' | 'range' = 'single') {
    await TestBed.configureTestingModule({ imports: [CalendarComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CalendarComponent);
    fixture.componentRef.setInput(
      'value',
      mode === 'single' ? '23/05/2026' : '18/05/2026 – 23/05/2026',
    );
    fixture.componentRef.setInput('selectionMode', mode);
    fixture.componentRef.setInput('minDate', '05/05/2026');
    fixture.componentRef.setInput('maxDate', '30/06/2026');
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const day = (text: string) => root.querySelector<HTMLButtonElement>(`[data-date="${text}"]`)!;
    const changed = vi.fn();
    fixture.componentInstance.valueChange.subscribe(changed);
    return { fixture, root, day, changed, calendar: fixture.componentInstance };
  }

  it('uses Monday-first weeks, one day tab stop, an accessible selected date and authoritative bounds', async () => {
    const { fixture, root, day, changed, calendar } = await setup();
    expect(
      [...root.querySelectorAll('[role="columnheader"]')].map((cell) =>
        cell.getAttribute('aria-label'),
      ),
    ).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    expect(root.querySelectorAll('.dds-calendar__day[tabindex="0"]')).toHaveLength(1);
    expect(day('23/05/2026').closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe(
      'true',
    );
    expect(day('01/05/2026').disabled).toBe(true);
    expect(day('27/04/2026').disabled).toBe(true);
    day('01/05/2026').click();
    calendar.select(parseDate('01/05/2026')!);
    expect(changed).not.toHaveBeenCalled();
    day('25/05/2026').click();
    fixture.detectChanges();
    expect(changed).toHaveBeenCalledExactlyOnceWith('25/05/2026');
  });

  it('moves keyboard focus without committing, crosses month boundaries, then selects with Enter', async () => {
    const { fixture, calendar, root, day, changed } = await setup();
    calendar.focusActive();
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    expect(document.activeElement).toBe(day('31/05/2026'));
    await userEvent.keyboard('{ArrowRight}');
    fixture.detectChanges();
    expect(root.textContent).toContain('June 2026');
    expect(document.activeElement).toBe(day('01/06/2026'));
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(day('07/06/2026'));
    await userEvent.keyboard('{Home}{PageUp}');
    expect(document.activeElement).toBe(day('05/05/2026'));
    expect(changed).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(changed).toHaveBeenCalledExactlyOnceWith('05/05/2026');
  });

  it('commits ranges only at the end, restarts for earlier dates, permits same-day and cross-month ranges', async () => {
    const { fixture, day, calendar, changed, root } = await setup('range');
    day('25/05/2026').click();
    fixture.detectChanges();
    expect(root.textContent).toContain('Choose end date');
    expect(changed).not.toHaveBeenCalled();
    day('18/05/2026').click();
    fixture.detectChanges();
    expect(changed).not.toHaveBeenCalled();
    expect(calendar.rangeStart).toEqual(parseDate('18/05/2026'));
    day('18/05/2026').click();
    fixture.detectChanges();
    expect(changed).toHaveBeenLastCalledWith('18/05/2026 – 18/05/2026');
    day('29/05/2026').click();
    calendar.navigateMonth(1);
    fixture.detectChanges();
    day('02/06/2026').click();
    fixture.detectChanges();
    expect(changed).toHaveBeenLastCalledWith('29/05/2026 – 02/06/2026');
    expect(day('01/06/2026').classList.contains('dds-calendar__day--in-range')).toBe(true);
    calendar.clear();
    expect(changed).toHaveBeenLastCalledWith('');
    expect(calendar.rangeStart).toBeNull();
    expect(calendar.rangeEnd).toBeNull();
  });

  it('selects local Today only when allowed and disables choices for malformed constraints or disabled calendars', async () => {
    const { fixture, calendar, changed, root } = await setup();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 23, 12));
    calendar.today();
    expect(changed).toHaveBeenCalledExactlyOnceWith('23/05/2026');
    fixture.componentRef.setInput('maxDate', '22/05/2026');
    fixture.detectChanges();
    calendar.today();
    expect(changed).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('minDate', 'bad date');
    fixture.detectChanges();
    expect(calendar.configurationInvalid).toBe(true);
    expect(
      [...root.querySelectorAll('.dds-calendar__day')].every(
        (day) => (day as HTMLButtonElement).disabled,
      ),
    ).toBe(true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    calendar.clear();
    calendar.select(parseDate('20/05/2026')!);
    expect(changed).toHaveBeenCalledTimes(1);
  });
});
