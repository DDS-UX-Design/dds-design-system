import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type CheckboxValue = 'unchecked' | 'checked' | 'indeterminate';
export type CheckboxState = 'default' | 'focused' | 'disabled' | 'invalid';

let nextCheckboxId = 0;

/** A native checkbox with DDS labels, validation, disabled, and mixed-value treatments. */
@Component({
  selector: 'dds-checkbox',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
})
export class CheckboxComponent {
  /** Unique ID used to associate the native control and its visible option label. */
  @Input() inputId = `dds-checkbox-${nextCheckboxId++}`;
  @Input() label = 'Label';
  @Input() option = 'Option';
  @Input() value: CheckboxValue = 'unchecked';
  @Input() state: CheckboxState = 'default';
  @Input() required = false;
  @Input() showLabel = true;
  @Input() showOption = true;
  @Input() ariaLabel = 'Checkbox option';
  @Input() errorMessage = 'Select this option to continue.';
  @Input() showErrorMessage = true;

  @Output() valueChange = new EventEmitter<CheckboxValue>();

  get isChecked(): boolean {
    return this.value === 'checked';
  }

  get isIndeterminate(): boolean {
    return this.value === 'indeterminate';
  }

  get isDisabled(): boolean {
    return this.state === 'disabled';
  }

  get isInvalid(): boolean {
    return this.state === 'invalid';
  }

  get errorId(): string {
    return `${this.inputId}-error`;
  }

  handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.checked ? 'checked' : 'unchecked';
    this.valueChange.emit(this.value);
  }
}
