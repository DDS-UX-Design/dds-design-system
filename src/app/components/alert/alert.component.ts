import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { DdsIconName, IconComponent } from '../icon/icon.component';

export type AlertTone = 'info' | 'warning' | 'success' | 'danger';
export type AlertSize = 'web' | 'mobile';

/**
 * An inline status message that communicates important contextual information.
 */
@Component({
  selector: 'dds-alert',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  /** Semantic tone used to communicate the nature of the message. */
  @Input() tone: AlertTone = 'info';

  /** Responsive density defined by the DDS component specification. */
  @Input() size: AlertSize = 'web';

  /** Alert message displayed to the user. */
  @Input() text = 'Alert text';

  /** Shows the semantic status icon. */
  @Input() showIcon = true;

  /** Shows a control that allows the alert to be dismissed. */
  @Input() dismissible = true;

  /** Shows an optional supporting action. */
  @Input() showAction = false;

  /** Label for the optional supporting action. */
  @Input() actionLabel = 'Action';

  /** Emitted when the dismiss control is activated. */
  @Output() dismissed = new EventEmitter<void>();

  /** Emitted when the supporting action is activated. */
  @Output() action = new EventEmitter<void>();

  get iconName(): DdsIconName {
    return 'info';
  }

  get iconSize(): number {
    return this.size === 'mobile' ? 18 : 24;
  }

  dismiss(): void {
    this.dismissed.emit();
  }

  activateAction(): void {
    this.action.emit();
  }
}
