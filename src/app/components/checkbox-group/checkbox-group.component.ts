import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CheckboxComponent, CheckboxState, CheckboxValue } from '../checkbox/checkbox.component';

export type CheckboxGroupDirection = 'inline' | 'stacked';
export type CheckboxGroupState = 'default' | 'invalid' | 'disabled';

export interface CheckboxGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
}

let nextCheckboxGroupId = 0;

/** A labelled set of independent checkbox options in an inline or stacked layout. */
@Component({
  selector: 'dds-checkbox-group',
  standalone: true,
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './checkbox-group.component.html',
  styleUrl: './checkbox-group.component.css',
})
export class CheckboxGroupComponent {
  @Input() groupId = `dds-checkbox-group-${nextCheckboxGroupId++}`;
  @Input() label = 'Label';
  @Input() options: CheckboxGroupOption[] = [
    { label: 'Option 1', value: 'option-1' },
    { label: 'Option 2', value: 'option-2' },
    { label: 'Option 3', value: 'option-3' },
    { label: 'Option 4', value: 'option-4' },
  ];
  @Input() selectedValues: string[] = [];
  @Input() direction: CheckboxGroupDirection = 'inline';
  @Input() state: CheckboxGroupState = 'default';
  @Input() required = true;
  @Input() showLabel = true;
  @Input() helperText = 'Select all options that apply.';
  @Input() showHelperText = false;
  @Input() errorMessage = 'Select at least one option.';

  @Output() selectedValuesChange = new EventEmitter<string[]>();

  get supportingTextId(): string {
    return `${this.groupId}-${this.state === 'invalid' ? 'error' : 'helper'}`;
  }

  get describedBy(): string | undefined {
    return this.state === 'invalid' || this.showHelperText ? this.supportingTextId : undefined;
  }

  optionState(option: CheckboxGroupOption): CheckboxState {
    if (this.state === 'disabled' || option.disabled) return 'disabled';
    if (this.state === 'invalid') return 'invalid';
    return 'default';
  }

  optionValue(option: CheckboxGroupOption): CheckboxValue {
    return this.selectedValues.includes(option.value) ? 'checked' : 'unchecked';
  }

  toggle(option: CheckboxGroupOption, value: CheckboxValue): void {
    const selected = new Set(this.selectedValues);
    value === 'checked' ? selected.add(option.value) : selected.delete(option.value);
    this.selectedValues = [...selected];
    this.selectedValuesChange.emit(this.selectedValues);
  }
}
