import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DdsIconName, IconComponent } from '../icon/icon.component';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonState = 'default' | 'hover' | 'focused' | 'disabled';
export type ButtonStyle = 'default' | 'danger';
export type ButtonSize = 'large' | 'medium' | 'small';
export type ButtonIconType = 'no-icon' | 'left-icon' | 'right-icon' | 'icon-only';
export type ButtonIconAnimation = 'none' | 'spin' | 'spin-on-press';

/**
 * A reusable button component for primary actions, secondary actions, and icon-only affordances.
 * Supports variants, size options, semantic states, and optional leading or trailing icons.
 */
@Component({
  selector: 'dds-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  /** Visual treatment for the button, used to communicate action importance. */
  @Input() variant: ButtonVariant = 'primary';

  /** Visual state used for design previews and interaction feedback. */
  @Input() state: ButtonState = 'default';

  /** Semantic style that can switch the button to a destructive treatment. */
  @Input() styleType: ButtonStyle = 'default';

  /** Size of the button to match surrounding layout and hierarchy. */
  @Input() size: ButtonSize = 'large';

  /** Placement of the icon, or whether the button should render as icon-only. */
  @Input() iconType: ButtonIconType = 'no-icon';

  /** Name of the icon to display when icon placement is enabled. */
  @Input() icon: DdsIconName = 'info';

  /** Optional motion treatment for animated action icons. */
  @Input() iconAnimation: ButtonIconAnimation = 'none';

  /** Accessible label for icon-only buttons when the visible label is not present. */
  @Input() ariaLabel?: string;

  /** Native button type used for form submission and button semantics. */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /** Disables interaction and applies the disabled visual treatment. */
  @Input() disabled = false;

  /** Expands the button to fill the available width of its container. */
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
      return 16;
    }

    if (this.size === 'medium') {
      return 20;
    }

    return 24;
  }
}
