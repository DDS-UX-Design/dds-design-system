import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RadioComponent, RadioState } from '../radio/radio.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

export type RadioGroupDirection = 'inline' | 'stacked';
export type RadioGroupState = 'default' | 'invalid' | 'disabled';

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

let nextRadioGroupId = 0;

/** A labelled set of mutually exclusive radio options in an inline or stacked layout. */
@Component({
  selector: 'dds-radio-group',
  standalone: true,
  imports: [CommonModule, RadioComponent, SkeletonComponent],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.css',
})
export class RadioGroupComponent {
  @Input() groupId = `dds-radio-group-${nextRadioGroupId++}`;
  @Input() label = 'Label text';
  @Input() options: RadioOption[] = [
    { label: 'Option 1', value: 'option-1' },
    { label: 'Option 2', value: 'option-2' },
    { label: 'Option 3', value: 'option-3' },
    { label: 'Option 4', value: 'option-4' },
  ];
  @Input() selectedValue = 'option-1';
  @Input() direction: RadioGroupDirection = 'inline';
  @Input() state: RadioGroupState = 'default';
  @Input() required = true;
  @Input() showLabel = true;
  @Input() errorMessage = 'Select an option to continue.';
  @Input() loading = false;

  @Output() selectedValueChange = new EventEmitter<string>();

  get errorId(): string {
    return `${this.groupId}-error`;
  }

  optionState(option: RadioOption): RadioState {
    if (this.state === 'disabled' || option.disabled) return 'disabled';
    if (this.state === 'invalid') return 'invalid';
    return 'default';
  }

  select(value: string): void {
    this.selectedValue = value;
    this.selectedValueChange.emit(value);
  }
}
