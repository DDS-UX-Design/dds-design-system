import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DdsIconName, IconComponent } from '../icon/icon.component';

export type ButtonVariant = 'primary' | 'outlined' | 'ghost';
export type ButtonState = 'default' | 'hover' | 'focused' | 'disabled';
export type ButtonStyle = 'default' | 'danger';
export type ButtonSize = 'large' | 'medium' | 'small';
export type ButtonIconType = 'no-icon' | 'left-icon' | 'right-icon' | 'icon-only';

@Component({
  selector: 'dds-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() state: ButtonState = 'default';
  @Input() styleType: ButtonStyle = 'default';
  @Input() size: ButtonSize = 'large';
  @Input() iconType: ButtonIconType = 'no-icon';
  @Input() icon: DdsIconName = 'info';
  @Input() ariaLabel?: string;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() fullWidth = false;

  get isDisabled(): boolean {
    return this.disabled || this.state === 'disabled';
  }

  get hasLeftIcon(): boolean {
    return this.iconType === 'left-icon';
  }

  get hasRightIcon(): boolean {
    return this.iconType === 'right-icon';
  }

  get isIconOnly(): boolean {
    return this.iconType === 'icon-only';
  }

  get iconSize(): number {
    if (this.size === 'small') {
      return 14;
    }

    if (this.size === 'medium') {
      return 16;
    }

    return 18;
  }
}