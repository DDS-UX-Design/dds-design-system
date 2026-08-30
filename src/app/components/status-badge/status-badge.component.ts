import { Component, Input } from '@angular/core';

export type StatusBadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'dds-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  @Input() text = 'Status';
  @Input() tone: StatusBadgeTone = 'info';
}
