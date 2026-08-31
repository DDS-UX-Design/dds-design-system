import { Component, Input } from '@angular/core';

export type StatusBadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';
export type StatusBadgeSize = 'large' | 'small';

@Component({
  selector: 'dds-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  @Input() text = 'Status';
  @Input() tone: StatusBadgeTone = 'info';
  @Input() size: StatusBadgeSize = 'large';
}
