import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type PasswordInputSize = 'desktop' | 'mobile';
export type PasswordInputState = 'default' | 'focused' | 'error';

let nextPasswordInputId = 0;

@Component({
  selector: 'dds-password-input',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.css',
})
export class PasswordInputComponent {
  @Input() inputId = `dds-password-input-${nextPasswordInputId++}`;
  @Input() label = 'Password';
  @Input() placeholder = 'Enter password';
  @Input() value = '';
  @Input() errorMessage = 'Password is required';
  @Input() size: PasswordInputSize = 'desktop';
  @Input() state: PasswordInputState = 'default';
  @Input() required = false;
  @Input() showLabel = true;
  @Input() showErrorMessage = true;
  @Input() ariaLabel?: string;
  @Input() visible = false;
  @Input() disabled = false;
  @Input() name?: string;
  @Input() autocomplete = 'current-password';

  @Output() valueChange = new EventEmitter<string>();
  @Output() visibleChange = new EventEmitter<boolean>();

  get isError(): boolean {
    return this.state === 'error';
  }

  get iconSize(): number {
    return this.size === 'mobile' ? 20 : 24;
  }

  get errorId(): string {
    return `${this.inputId}-error`;
  }

  handleInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
  }

  toggleVisibility(): void {
    if (this.disabled) {
      return;
    }

    this.visible = !this.visible;
    this.visibleChange.emit(this.visible);
  }
}
