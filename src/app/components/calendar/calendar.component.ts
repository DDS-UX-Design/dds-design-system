import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  addDays,
  addMonths,
  dateOnly,
  formatDate,
  localToday,
  parseDate,
  parseRange,
} from './calendar-date';

let nextCalendarId = 0;

/** Monday-first single-date and inclusive-range calendar. Date Input provides popup opening and dismissal. */
@Component({
  selector: 'dds-calendar',
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnChanges {
  @Input() value = '';
  @Input() selectionMode: 'single' | 'range' = 'single';
  @Input() size: 'desktop' | 'mobile' = 'desktop';
  /** Inclusive bounds, in the same DD/MM/YYYY format as value. */
  @Input() minDate = '';
  @Input() maxDate = '';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() draftChange = new EventEmitter<string>();
  rangeStart: Date | null = null;
  rangeEnd: Date | null = null;
  selectingEnd = false;
  readonly id = `dds-calendar-${++nextCalendarId}`;
  readonly weekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  readonly weekdayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  month = dateOnly(localToday().getUTCFullYear(), localToday().getUTCMonth(), 1);
  activeDate = localToday();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly changeDetector = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['minDate'] || changes['maxDate'] || changes['selectionMode']) {
      const range = this.selectionMode === 'range' ? parseRange(this.value) : null;
      this.rangeStart = range?.start ?? null;
      this.rangeEnd = range && range.end >= range.start ? range.end : null;
      this.selectingEnd = false;
      this.activeDate = this.clamp(range?.start ?? parseDate(this.value) ?? localToday());
      this.month = dateOnly(this.activeDate.getUTCFullYear(), this.activeDate.getUTCMonth(), 1);
    }
  }

  get monthLabel(): string {
    return this.month.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  get weeks(): Date[][] {
    const offset = (this.month.getUTCDay() + 6) % 7;
    const count = dateOnly(
      this.month.getUTCFullYear(),
      this.month.getUTCMonth() + 1,
      0,
    ).getUTCDate();
    return Array.from({ length: Math.ceil((offset + count) / 7) }, (_, week) =>
      Array.from({ length: 7 }, (_, day) => addDays(this.month, week * 7 + day - offset)),
    );
  }

  get configurationInvalid(): boolean {
    const min = parseDate(this.minDate);
    const max = parseDate(this.maxDate);
    return Boolean((this.minDate && !min) || (this.maxDate && !max) || (min && max && min > max));
  }

  get todayDisabled(): boolean {
    return !this.allowed(localToday());
  }

  format = formatDate;

  label(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  outside(date: Date): boolean {
    return date.getUTCMonth() !== this.month.getUTCMonth();
  }

  allowed(date: Date): boolean {
    const min = parseDate(this.minDate);
    const max = parseDate(this.maxDate);
    return (
      !this.disabled &&
      !this.configurationInvalid &&
      date.getUTCFullYear() >= 1 &&
      date.getUTCFullYear() <= 9999 &&
      (!min || date >= min) &&
      (!max || date <= max)
    );
  }

  monthDisabled(offset: number): boolean {
    const first = addMonths(this.month, offset);
    const last = dateOnly(first.getUTCFullYear(), first.getUTCMonth() + 1, 0);
    const min = parseDate(this.minDate);
    const max = parseDate(this.maxDate);
    return (
      this.disabled ||
      this.configurationInvalid ||
      first.getUTCFullYear() < 1 ||
      first.getUTCFullYear() > 9999 ||
      Boolean((min && last < min) || (max && first > max))
    );
  }

  navigateMonth(offset: number, event?: Event): void {
    if (this.monthDisabled(offset)) return;
    (event?.currentTarget as HTMLButtonElement | undefined)?.focus({ preventScroll: true });
    this.activeDate = this.clamp(addMonths(this.activeDate, offset));
    this.month = dateOnly(this.activeDate.getUTCFullYear(), this.activeDate.getUTCMonth(), 1);
  }

  select(date: Date): void {
    if (!this.allowed(date) || this.outside(date)) return;
    this.activeDate = date;
    if (this.selectionMode === 'range') {
      if (!this.selectingEnd || !this.rangeStart || date < this.rangeStart) {
        this.rangeStart = date;
        this.rangeEnd = null;
        this.selectingEnd = true;
        this.changeDetector.detectChanges();
        this.focusActive();
        this.draftChange.emit(`${formatDate(date)} – End date`);
        return;
      }
      this.rangeEnd = date;
      this.selectingEnd = false;
      this.value = `${formatDate(this.rangeStart)} – ${formatDate(date)}`;
    } else this.value = formatDate(date);
    this.draftChange.emit('');
    this.valueChange.emit(this.value);
  }

  today(): void {
    if (this.selectionMode !== 'single') return;
    const today = localToday();
    if (!this.allowed(today)) return;
    this.value = formatDate(today);
    this.valueChange.emit(this.value);
  }

  clear(): void {
    if (this.disabled) return;
    this.value = '';
    this.rangeStart = this.rangeEnd = null;
    this.selectingEnd = false;
    this.draftChange.emit('');
    this.valueChange.emit('');
  }

  selected(date: Date): boolean {
    return this.selectionMode === 'range'
      ? Boolean(
          (this.rangeStart && +date === +this.rangeStart) ||
          (this.rangeEnd && +date === +this.rangeEnd),
        )
      : formatDate(date) === this.value;
  }

  inRange(date: Date): boolean {
    return (
      this.selectionMode === 'range' &&
      Boolean(this.rangeStart && this.rangeEnd && date > this.rangeStart && date < this.rangeEnd)
    );
  }

  onDayKeydown(event: KeyboardEvent): void {
    const key = event.key;
    let next: Date;
    if (key === 'ArrowLeft') next = addDays(this.activeDate, -1);
    else if (key === 'ArrowRight') next = addDays(this.activeDate, 1);
    else if (key === 'ArrowUp') next = addDays(this.activeDate, -7);
    else if (key === 'ArrowDown') next = addDays(this.activeDate, 7);
    else if (key === 'Home')
      next = addDays(this.activeDate, -((this.activeDate.getUTCDay() + 6) % 7));
    else if (key === 'End')
      next = addDays(this.activeDate, 6 - ((this.activeDate.getUTCDay() + 6) % 7));
    else if (key === 'PageUp') next = addMonths(this.activeDate, event.shiftKey ? -12 : -1);
    else if (key === 'PageDown') next = addMonths(this.activeDate, event.shiftKey ? 12 : 1);
    else return;
    event.preventDefault();
    if (this.disabled || this.configurationInvalid) return;
    this.activeDate = this.clamp(next);
    this.month = dateOnly(this.activeDate.getUTCFullYear(), this.activeDate.getUTCMonth(), 1);
    this.changeDetector.detectChanges();
    this.focusActive();
  }

  focusActive(): void {
    const date = formatDate(this.activeDate);
    const target =
      this.element.nativeElement.querySelector<HTMLElement>(
        `button[data-date="${date}"]:not(:disabled)`,
      ) ?? this.element.nativeElement.querySelector<HTMLElement>('h3');
    target?.focus({ preventScroll: true });
  }

  private clamp(date: Date): Date {
    const min = parseDate(this.minDate) ?? dateOnly(1, 0, 1);
    const max = parseDate(this.maxDate) ?? dateOnly(9999, 11, 31);
    return date < min ? min : date > max ? max : date;
  }
}
