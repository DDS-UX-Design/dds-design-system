import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type TextInputSize = 'desktop' | 'mobile';
export type TextInputState = 'default' | 'focused' | 'error';

let nextTextInputId = 0;

@Component({
  selector: 'dds-text-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.css',
})
export class TextInputComponent {
  @Input() inputId = `dds-text-input-${nextTextInputId++}`;
  @Input() label = 'Label Text';
  @Input() placeholder = 'Placeholder text...';
  @Input() value = '';
  @Input() helperText = 'Helper text';
  @Input() errorMessage = 'Error message';
  @Input() size: TextInputSize = 'desktop';
  @Input() state: TextInputState = 'default';
  @Input() required = false;
  @Input() showLabel = true;
  @Input() showHelperText = true;
  @Input() showErrorMessage = true;
  @Input() ariaLabel?: string;
  @Input() disabled = false;
  @Input() name?: string;
  @Input() autocomplete = 'off';
  @Input() maxLength?: number;

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

  handleInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
  }
}
