import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type RadioState = 'default' | 'focused' | 'disabled' | 'invalid';

let nextRadioId = 0;

/** A native radio input with DDS label, validation, focus, and disabled treatments. */
@Component({
  selector: 'dds-radio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.css',
})
export class RadioComponent {
  @Input() inputId = `dds-radio-${nextRadioId++}`;
  @Input() name = `dds-radio-group-${nextRadioId}`;
  @Input() label = 'Label';
  @Input() option = 'Option';
  @Input() value = 'option';
  @Input() checked = false;
  @Input() state: RadioState = 'default';
  @Input() required = false;
  @Input() showLabel = true;
  @Input() showOption = true;
  @Input() ariaLabel = 'Radio option';
  @Input() errorMessage = 'Select an option to continue.';
  @Input() showErrorMessage = true;
  @Input() describedBy?: string;

  @Output() checkedChange = new EventEmitter<boolean>();
  @Output() selected = new EventEmitter<string>();

  get isDisabled(): boolean {
    return this.state === 'disabled';
  }

  get isInvalid(): boolean {
    return this.state === 'invalid';
  }

  get errorId(): string {
    return `${this.inputId}-error`;
  }

  get ariaDescribedBy(): string | null {
    if (this.describedBy) return this.describedBy;
    return this.isInvalid && this.showErrorMessage ? this.errorId : null;
  }

  handleChange(): void {
    this.checked = true;
    this.checkedChange.emit(true);
    this.selected.emit(this.value);
  }
}
