import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type TextareaSize = 'large' | 'small';
export type TextareaState = 'default' | 'focused' | 'disabled' | 'error';

let nextTextareaId = 0;

/** A multi-line text field with DDS sizing, validation, helper text, and character-count treatments. */
@Component({
  selector: 'dds-textarea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.css',
})
export class TextareaComponent {
  /** Unique ID used to associate the label, field, and supporting text. */
  @Input() inputId = `dds-textarea-${nextTextareaId++}`;

  /** Visible field label. */
  @Input() label = 'Label text';

  /** Current field value. */
  @Input() value = '';

  /** Prompt displayed when the field is empty. */
  @Input() placeholder = 'Some text here…';

  /** Large or small typography treatment. */
  @Input() size: TextareaSize = 'large';

  /** Deterministic visual state for validation and documentation. */
  @Input() state: TextareaState = 'default';

  /** Maximum number of characters accepted by the field. */
  @Input() maxLength = 150;

  /** Marks the native textarea as required. */
  @Input() required = false;

  /** Shows the visible field label. */
  @Input() showLabel = true;

  /** Accessible name used when the visible label is hidden. */
  @Input() ariaLabel = 'Text response';

  /** Optional guidance displayed beneath the field. */
  @Input() helperText = 'Helper text';

  /** Shows optional guidance beneath non-error fields. */
  @Input() showHelperText = true;

  /** Validation guidance shown in the error state. */
  @Input() errorMessage = 'Enter a valid response.';

  /** Shows the current and maximum character count inside the field. */
  @Input() showCharacterCount = true;

  /** Emitted whenever the field value changes. */
  @Output() valueChange = new EventEmitter<string>();

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

  get countId(): string {
    return `${this.inputId}-count`;
  }

  get describedBy(): string | null {
    const ids = [];

    if (this.isError) {
      ids.push(this.errorId);
    } else if (this.showHelperText) {
      ids.push(this.helperId);
    }

    if (this.showCharacterCount) {
      ids.push(this.countId);
    }

    return ids.length ? ids.join(' ') : null;
  }

  handleInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    this.valueChange.emit(this.value);
  }
}
