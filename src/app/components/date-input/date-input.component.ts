import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type DateInputSize = 'desktop' | 'mobile';
export type DateInputState = 'default' | 'focused' | 'error';

let nextDateInputId = 0;

@Component({
  selector: 'dds-date-input',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './date-input.component.html',
  styleUrl: './date-input.component.css',
})
export class DateInputComponent {
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

  @Output() valueChange = new EventEmitter<string>();

  get isError(): boolean {
    return this.state === 'error';
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
    this.value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
  }
}
