import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { DdsIconName, IconComponent } from '../icon/icon.component';

export type ToastTone = 'info' | 'warning' | 'success' | 'danger';
export type ToastSize = 'large' | 'small';

/**
 * A temporary elevated notification that confirms an outcome or reports a change.
 */
@Component({
  selector: 'dds-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent implements OnChanges, OnDestroy {
  /** Semantic tone used to communicate the notification outcome. */
  @Input() tone: ToastTone = 'info';

  /** Typography and icon scale from the DDS component specification. */
  @Input() size: ToastSize = 'large';

  /** Optional concise notification title. */
  @Input() title = 'Toast title';

  /** Supporting notification message. */
  @Input() message = 'This is an example of a toast notification.';

  /** Shows the notification title. */
  @Input() showTitle = true;

  /** Shows a control that allows the toast to be dismissed. */
  @Input() dismissible = true;

  /** Time in milliseconds before an Info or Success toast is dismissed. */
  @Input() duration = 5000;

  /** Enables timed dismissal for Info and Success toasts. */
  @Input() autoDismiss = true;

  /** Emitted when the dismiss control is activated. */
  @Output() dismissed = new EventEmitter<void>();

  visible = true;
  private dismissTimer?: ReturnType<typeof setTimeout>;

  get isTimed(): boolean {
    return this.autoDismiss && (this.tone === 'info' || this.tone === 'success');
  }

  get showDismissControl(): boolean {
    return !this.isTimed || this.dismissible;
  }

  get iconName(): DdsIconName {
    const icons: Record<ToastTone, DdsIconName> = {
      info: 'info',
      warning: 'triangle-alert',
      success: 'circle-check',
      danger: 'circle-alert',
    };

    return icons[this.tone];
  }

  get iconSize(): number {
    return this.size === 'small' ? 20 : 24;
  }

  ngOnChanges(): void {
    this.visible = true;
    this.startDismissTimer();
  }

  ngOnDestroy(): void {
    this.clearDismissTimer();
  }

  dismiss(): void {
    this.clearDismissTimer();
    this.visible = false;
    this.dismissed.emit();
  }

  private startDismissTimer(): void {
    this.clearDismissTimer();

    if (!this.isTimed || this.duration <= 0) {
      return;
    }

    this.dismissTimer = setTimeout(() => this.dismiss(), this.duration);
  }

  private clearDismissTimer(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = undefined;
    }
  }
}
