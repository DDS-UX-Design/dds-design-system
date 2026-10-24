import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToggleComponent } from '../toggle/toggle.component';

let nextToggleFieldId = 0;

/** A labelled immediate setting. The whole non-interactive row activates the native switch once. */
@Component({
  selector: 'dds-toggle-field',
  standalone: true,
  imports: [ToggleComponent],
  templateUrl: './toggle-field.component.html',
  styleUrl: './toggle-field.component.css',
})
export class ToggleFieldComponent {
  @Input() inputId = `dds-toggle-field-${nextToggleFieldId++}`;
  @Input() label = 'Low-stock alerts';
  @Input() helperText = 'Get notified when stock runs low.';
  @Input() showHelperText = true;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() name?: string;
  @Output() checkedChange = new EventEmitter<boolean>();

  handleChange(checked: boolean): void {
    if (this.disabled) return;
    this.checked = checked;
    this.checkedChange.emit(checked);
  }
}
