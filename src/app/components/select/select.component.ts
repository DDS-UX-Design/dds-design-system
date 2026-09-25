import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

export type SelectSize = 'large' | 'small';
export type SelectState = 'default' | 'focused' | 'disabled' | 'error';

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

let nextSelectId = 0;

/**
 * A native single- or multi-select field with DDS sizing, validation, and helper text treatments.
 */
@Component({
  selector: 'dds-select',
  standalone: true,
  imports: [CommonModule, IconComponent, SkeletonComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
})
export class SelectComponent {
  /** Unique ID used to associate the label, field, and supporting text. */
  @Input() inputId = `dds-select-${nextSelectId++}`;

  /** Visible field label. */
  @Input() label = 'Select option';

  /** Current option value. */
  @Input() value = '';

  /** Enables the native multi-select variant. */
  @Input() multiple = false;

  /** Selected option values used by the multi-select variant. */
  @Input() selectedValues: string[] = [];

  /** Number of visible rows in the multi-select variant. */
  @Input() visibleOptionCount = 4;

  /** Placeholder shown before an option is selected. */
  @Input() placeholder = 'Select option';

  /** Available options in display order. */
  @Input() options: SelectOption[] = [];

  /** Responsive size from the DDS specification. */
  @Input() size: SelectSize = 'large';

  /** Deterministic visual state for validation and documentation. */
  @Input() state: SelectState = 'default';

  /** Marks the native select as required. */
  @Input() required = false;

  /** Shows the visible field label. */
  @Input() showLabel = true;

  /** Accessible name used when the visible label is hidden. */
  @Input() ariaLabel = 'Select option';

  /** Optional guidance displayed beneath the field. */
  @Input() helperText = 'Choose one option.';

  /** Shows optional guidance beneath non-error fields. */
  @Input() showHelperText = true;

  /** Validation guidance shown in the error state. */
  @Input() errorMessage = 'Select an option to continue.';

  /** Replaces the field content with shape-matched skeletons while options are loading. */
  @Input() loading = false;

  /** Emitted whenever the selected value changes. */
  @Output() valueChange = new EventEmitter<string>();

  /** Emitted whenever the multi-select values change. */
  @Output() selectedValuesChange = new EventEmitter<string[]>();

  get isDisabled(): boolean {
    return this.state === 'disabled';
  }

  get isError(): boolean {
    return this.state === 'error';
  }

  get helperId(): string {
    return `${this.inputId}-helper`;
  }

  get errorId(): string {
    return `${this.inputId}-error`;
  }

  get describedBy(): string | null {
    if (this.isError) {
      return this.errorId;
    }

    return this.showHelperText ? this.helperId : null;
  }

  handleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    if (this.multiple) {
      this.selectedValues = Array.from(select.selectedOptions, (option) => option.value);
      this.selectedValuesChange.emit(this.selectedValues);
      return;
    }

    this.value = select.value;
    this.valueChange.emit(this.value);
  }
}
