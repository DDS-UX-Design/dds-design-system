import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DdsIconName, IconComponent } from '../icon/icon.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

export type KpiCardTrend = 'positive' | 'neutral' | 'negative';

/** A compact dashboard card that displays one key metric and its comparative trend. */
@Component({
  selector: 'dds-kpi-card',
  standalone: true,
  imports: [CommonModule, IconComponent, SkeletonComponent],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.css',
})
export class KpiCardComponent {
  /** Short label that identifies the metric. */
  @Input() label = 'Card title';

  /** Current metric value. Strings preserve formatting for large or decimal values. */
  @Input() value: string | number = 142;

  /** Optional unit displayed before the value, such as KES or $. */
  @Input() prefix = '';

  /** Optional unit displayed after the value, such as % or hrs. */
  @Input() suffix = '';

  /** Semantic direction of change. Neutral trends do not display an arrow. */
  @Input() trend: KpiCardTrend = 'positive';

  /** Comparative change and period, such as “8.2% vs last month”. */
  @Input() trendText = '8.2% vs last month';

  /** Replaces the metric content with shape-matched skeletons while data is loading. */
  @Input() loading = false;

  get trendIcon(): DdsIconName | null {
    if (this.trend === 'positive') return 'arrow-up';
    if (this.trend === 'negative') return 'arrow-down';
    return null;
  }

  get accessibleLabel(): string {
    if (this.loading) return `${this.label} is loading`;

    const metric = [this.prefix, this.value, this.suffix].filter(String).join(' ');
    return `${this.label}: ${metric}. ${this.trendText}`;
  }
}
