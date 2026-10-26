import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { parseDate, parseRange } from '../calendar/calendar-date';
import { CalendarComponent } from '../calendar/calendar.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

export type DateInputSize = 'desktop' | 'mobile';
export type DateInputState = 'default' | 'focused' | 'error';
export type DateInputSelectionMode = 'single' | 'range';

let nextDateInputId = 0;

@Component({
  selector: 'dds-date-input',
  standalone: true,
  imports: [CommonModule, IconComponent, SkeletonComponent, CalendarComponent],
  templateUrl: './date-input.component.html',
  styleUrl: './date-input.component.css',
})
export class DateInputComponent implements OnChanges, OnDestroy {
  @Input() inputId = `dds-date-input-${nextDateInputId++}`;
  @Input() label = 'Date';
  @Input() placeholder = 'DD/MM/YYYY';
  @Input() value = '';
  @Input() helperText = 'Enter the date in DD/MM/YYYY format';
  @Input() errorMessage = 'Enter a valid date in DD/MM/YYYY format';
  @Input() size: DateInputSize = 'desktop';
  @Input() state: DateInputState = 'default';
  @Input() required = false;
  @Input() showLabel = true;
  @Input() showHelperText = true;
  @Input() showErrorMessage = true;
  @Input() ariaLabel?: string;
  @Input() disabled = false;
  @Input() name?: string;
  @Input() autocomplete = 'off';
  /** Replaces the field content with shape-matched skeletons while data is loading. */
  @Input() loading = false;

  /** Disable for text-only entry. Existing value/valueChange remain DD/MM/YYYY strings. */
  @Input() calendarEnabled = true;
  @Input() selectionMode: DateInputSelectionMode = 'single';
  draftValue = '';
  private rangeBlurred = false;
  /** Inclusive calendar bounds. Single-date manual text validation remains application-owned. */
  @Input() minDate = '';
  @Input() maxDate = '';
  calendarOpen = false;
  @ViewChild('panel') private panel?: ElementRef<HTMLDivElement>;
  @ViewChild('calendarTrigger') private calendarTrigger?: ElementRef<HTMLButtonElement>;
  @ViewChild(CalendarComponent) private calendar?: CalendarComponent;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private resizeObserver?: ResizeObserver;
  private readonly reposition = () => this.positionCalendar();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['selectionMode'] || changes['minDate'] || changes['maxDate'])
      this.draftValue = '';
    if (changes['selectionMode'] && this.calendarOpen) this.closeCalendar(false);
    if (this.disabled || this.loading || !this.calendarEnabled) this.closeCalendar(false);
  }

  ngOnDestroy(): void {
    this.closeCalendar(false);
  }

  openCalendar(): void {
    if (this.disabled || this.loading || !this.calendarEnabled || this.calendarOpen) return;
    this.calendarOpen = true;
    this.changeDetector.detectChanges();
    const panel = this.panel!.nativeElement;
    if (typeof panel.showPopover === 'function') panel.showPopover();
    this.positionCalendar();
    this.calendar?.focusActive();
    const window = panel.ownerDocument.defaultView!;
    window.addEventListener('resize', this.reposition);
    window.addEventListener('scroll', this.reposition, true);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.reposition);
      this.resizeObserver.observe(panel);
      this.resizeObserver.observe(this.element.nativeElement);
    }
  }

  closeCalendar(restoreFocus = true): void {
    if (!this.calendarOpen) return;
    const panel = this.panel?.nativeElement;
    if (panel && typeof panel.hidePopover === 'function' && panel.matches(':popover-open'))
      panel.hidePopover();
    this.calendarOpen = false;
    this.draftValue = '';
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    const window = this.element.nativeElement.ownerDocument.defaultView;
    window?.removeEventListener('resize', this.reposition);
    window?.removeEventListener('scroll', this.reposition, true);
    this.changeDetector.markForCheck();
    if (restoreFocus && !this.disabled && !this.loading)
      this.calendarTrigger?.nativeElement.focus({ preventScroll: true });
  }

  toggleCalendar(): void {
    if (this.calendarOpen) this.closeCalendar();
    else this.openCalendar();
  }

  selectDate(value: string): void {
    if (this.disabled || this.loading) return;
    this.value = value;
    this.valueChange.emit(value);
    this.closeCalendar();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.calendarOpen) {
      event.preventDefault();
      event.stopPropagation();
      this.closeCalendar();
    } else if (event.key === 'ArrowDown' && event.altKey) {
      if (this.disabled || this.loading || !this.calendarEnabled) return;
      event.preventDefault();
      this.openCalendar();
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  onOutsidePointer(event: PointerEvent): void {
    if (this.calendarOpen && !this.element.nativeElement.contains(event.target as Node))
      this.closeCalendar(false);
  }

  @HostListener('document:focusin', ['$event'])
  onOutsideFocus(event: FocusEvent): void {
    if (this.calendarOpen && !this.element.nativeElement.contains(event.target as Node))
      this.closeCalendar(false);
  }

  private positionCalendar(): void {
    const panel = this.panel?.nativeElement;
    if (!panel || !this.calendarOpen) return;
    const window = panel.ownerDocument.defaultView!;
    const anchor = this.element.nativeElement.getBoundingClientRect();
    const box = panel.getBoundingClientRect();
    const left = Math.max(8, Math.min(anchor.left, window.innerWidth - box.width - 8));
    let top = anchor.bottom + 8;
    if (top + box.height > window.innerHeight - 8) top = anchor.top - box.height - 8;
    panel.style.left = `${left}px`;
    panel.style.top = `${Math.max(8, top)}px`;
  }

  @Output() valueChange = new EventEmitter<string>();

  get isError(): boolean {
    return this.state === 'error' || Boolean(this.rangeError);
  }

  get displayValue(): string {
    return this.calendarOpen && this.draftValue ? this.draftValue : this.value;
  }

  get rangeError(): string {
    if (this.selectionMode !== 'range' || !this.value) return '';
    const range = parseRange(this.value);
    if (!range)
      return this.rangeBlurred ? 'Enter a valid date range in DD/MM/YYYY – DD/MM/YYYY format.' : '';
    if (range.end < range.start) return 'End date must be on or after start date';
    const min = parseDate(this.minDate);
    const max = parseDate(this.maxDate);
    if ((min && range.start < min) || (max && range.end > max))
      return 'Choose dates within the allowed range.';
    return '';
  }

  get displayErrorMessage(): string {
    return this.state === 'error' ? this.errorMessage : this.rangeError || this.errorMessage;
  }

  onBlur(): void {
    this.rangeBlurred = true;
  }

  get messageId(): string {
    return `${this.inputId}-${this.isError ? 'error' : 'helper'}`;
  }

  get describedBy(): string | null {
    if (this.isError) {
      return this.showErrorMessage ? this.messageId : null;
    }

    return this.showHelperText ? this.messageId : null;
  }

  get iconSize(): number {
    return this.size === 'mobile' ? 20 : 24;
  }

  handleInput(event: Event): void {
    if (this.disabled || this.loading) return;
    this.closeCalendar(false);
    this.value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
  }
}
