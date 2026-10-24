import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ToggleSize = 'large' | 'small';
export type ToggleState = 'default' | 'hover' | 'focused' | 'disabled';
let nextToggleId = 0;

/** An immediate binary setting. Provide a stable accessible name for the setting. */
@Component({
  selector: 'dds-toggle',
  standalone: true,
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.css',
})
export class ToggleComponent {
  @Input() inputId = `dds-toggle-${nextToggleId++}`;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() size: ToggleSize = 'large';
  /** Preview state; native pointer and keyboard states work independently. */
  @Input() state: ToggleState = 'default';
  @Input() ariaLabel = 'Setting';
  @Input() labelledBy?: string;
  @Input() describedBy?: string;
  @Input() name?: string;
  @Output() checkedChange = new EventEmitter<boolean>();

  get isDisabled(): boolean {
    return this.disabled || this.state === 'disabled';
  }

  handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isDisabled) {
      input.checked = this.checked;
      return;
    }
    this.checked = input.checked;
    this.checkedChange.emit(this.checked);
  }
}
