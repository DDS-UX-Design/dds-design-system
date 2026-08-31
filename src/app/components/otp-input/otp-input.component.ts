import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

export type OtpInputSize = 'desktop' | 'mobile';
export type OtpInputState = 'default' | 'focused' | 'error' | 'disabled-loading';

let nextOtpInputId = 0;

/**
 * A six-digit one-time-code field with paste, mobile autofill, and validation support.
 */
@Component({
  selector: 'dds-otp-input',
  standalone: true,
  imports: [CommonModule, IconComponent, SkeletonComponent],
  templateUrl: './otp-input.component.html',
  styleUrl: './otp-input.component.css',
})
export class OtpInputComponent {
  @ViewChild('otpInput') otpInput?: ElementRef<HTMLInputElement>;

  /** Unique ID for the native input and visible label. */
  @Input() inputId = `dds-otp-input-${nextOtpInputId++}`;

  /** Visible field label. */
  @Input() label = 'Verification code';

  /** Current numeric one-time code. */
  @Input() value = '';

  /** Responsive dimensions from the DDS specification. */
  @Input() size: OtpInputSize = 'desktop';

  /** Deterministic visual state for validation and documentation. */
  @Input() state: OtpInputState = 'default';

  /** Marks the native input as required. */
  @Input() required = true;

  /** Shows the visible field label. */
  @Input() showLabel = false;

  /** Accessible name used when the visible label is hidden. */
  @Input() ariaLabel = 'Six-digit verification code';

  /** Validation guidance shown in the error state. */
  @Input() errorMessage = 'Enter the complete six-digit code.';

  /** Shows validation guidance in the error state. */
  @Input() showErrorMessage = true;

  /** Shows the expiry information beneath the fields. */
  @Input() showCodeExpiry = true;

  /** Switches the expiry information to its expired treatment. */
  @Input() codeExpired = false;

  /** Formatted time remaining for the current code. */
  @Input() expiryTime = '02:57';

  /** Replaces the code fields and optional surrounding content with skeletons while loading. */
  @Input() loading = false;

  /** Emitted whenever the numeric code changes. */
  @Output() valueChange = new EventEmitter<string>();

  /** Emitted once all six digits have been entered. */
  @Output() completed = new EventEmitter<string>();

  readonly digits = Array.from({ length: 6 }, (_, index) => index);
  hasNativeFocus = false;

  get isDisabled(): boolean {
    return this.state === 'disabled-loading';
  }

  get isError(): boolean {
    return this.state === 'error';
  }

  get activeIndex(): number {
    return Math.min(this.value.length, this.digits.length - 1);
  }

  get errorId(): string {
    return `${this.inputId}-error`;
  }

  get expiryId(): string {
    return `${this.inputId}-expiry`;
  }

  get describedBy(): string | null {
    const ids: string[] = [];

    if (this.isError && this.showErrorMessage) {
      ids.push(this.errorId);
    }

    if (this.showCodeExpiry) {
      ids.push(this.expiryId);
    }

    return ids.length ? ids.join(' ') : null;
  }

  digitAt(index: number): string {
    return this.value[index] ?? '';
  }

  isActive(index: number): boolean {
    return (
      !this.isDisabled &&
      (this.hasNativeFocus || this.state === 'focused') &&
      index === this.activeIndex
    );
  }

  focusInput(): void {
    if (!this.isDisabled) {
      this.otpInput?.nativeElement.focus();
    }
  }

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const nextValue = input.value.replace(/\D/g, '').slice(0, this.digits.length);

    input.value = nextValue;
    this.value = nextValue;
    this.valueChange.emit(nextValue);

    if (nextValue.length === this.digits.length) {
      this.completed.emit(nextValue);
    }
  }
}
