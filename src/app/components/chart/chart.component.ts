import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartDataset,
  DoughnutController,
  ArcElement,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  Tooltip,
} from 'chart.js';

export type DdsChartType =
  'donut' | 'pie' | 'gauge' | 'line' | 'horizontal-bar' | 'grouped-bar' | 'stacked-bar';
export type DdsChartLegendPosition = 'right' | 'bottom' | 'top';

export interface DdsChartSeries {
  label: string;
  data: number[];
}

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  Tooltip,
);

const CHART_COLOURS = [
  '--color-chart-categorical-01',
  '--color-chart-categorical-02',
  '--color-chart-categorical-03',
  '--color-chart-categorical-04',
  '--color-chart-categorical-05',
  '--color-chart-categorical-06',
] as const;

/** Experimental Chart.js wrapper for documenting DDS data-visualisation colour usage. */
@Component({
  selector: 'dds-chart',
  standalone: true,
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvas?: ElementRef<HTMLCanvasElement>;

  /** Chart pattern to render. */
  @Input() type: DdsChartType = 'donut';

  /** Category labels used by bar charts and circular segments. */
  @Input() labels: string[] = ['Series 1', 'Series 2', 'Series 3'];

  /** Data series. Circular charts use the first series and colour each value. */
  @Input() series: DdsChartSeries[] = [{ label: 'Value', data: [75, 15, 10] }];

  /** Legend placement. */
  @Input() legendPosition: DdsChartLegendPosition = 'right';

  /** Accessible summary announced instead of the visual canvas. */
  @Input() accessibleLabel = 'Chart';

  private chart?: Chart;
  private themeObserver?: MutationObserver;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngAfterViewInit(): void {
    this.renderChart();
    if (isPlatformBrowser(this.platformId) && this.canvas) {
      this.themeObserver = new MutationObserver(() => this.renderChart());
      // CSS handles normal components; canvas pixels need redrawing when a
      // theme changes on any ancestor, including a nested theme boundary.
      let ancestor: HTMLElement | null = this.canvas.nativeElement;
      while (ancestor) {
        this.themeObserver.observe(ancestor, { attributes: true, attributeFilter: ['data-theme'] });
        ancestor = ancestor.parentElement;
      }
    }
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.canvas) this.renderChart();
  }

  ngOnDestroy(): void {
    this.themeObserver?.disconnect();
    this.chart?.destroy();
  }

  get gaugeValue(): number {
    const values = this.series[0]?.data ?? [];
    const total = values.reduce((sum, value) => sum + value, 0);
    return total > 0 ? Math.round((values[0] / total) * 100) : 0;
  }

  private renderChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.canvas) return;

    this.chart?.destroy();
    const styles = getComputedStyle(this.canvas.nativeElement);
    const colours = CHART_COLOURS.map((token) => styles.getPropertyValue(token).trim());
    const isGauge = this.type === 'gauge';
    const isCircular = this.type === 'donut' || this.type === 'pie' || isGauge;
    const isLine = this.type === 'line';
    const isStacked = this.type === 'stacked-bar';
    const datasets: ChartDataset<'bar' | 'doughnut' | 'pie' | 'line', number[]>[] = isCircular
      ? [
          {
            label: this.series[0]?.label ?? 'Value',
            data: this.series[0]?.data ?? [],
            backgroundColor: isGauge
              ? [colours[0], styles.getPropertyValue('--color-chart-track').trim()]
              : colours,
            borderColor: styles.getPropertyValue('--color-bg-elevated').trim(),
            hoverBackgroundColor: isGauge
              ? [colours[0], styles.getPropertyValue('--color-chart-track').trim()]
              : colours,
            hoverBorderColor: styles.getPropertyValue('--color-bg-elevated').trim(),
            borderWidth: isGauge ? 0 : 1,
          },
        ]
      : isLine
        ? this.series.map((series, index) => ({
            ...series,
            backgroundColor: colours[index % colours.length],
            borderColor: colours[index % colours.length],
            borderWidth: 2,
            pointBackgroundColor: colours[index % colours.length],
            pointBorderColor: styles.getPropertyValue('--color-bg-elevated').trim(),
            pointHoverBackgroundColor: colours[index % colours.length],
            pointHoverBorderColor: styles.getPropertyValue('--color-bg-elevated').trim(),
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.25,
          }))
        : this.series.map((series, index) => ({
            ...series,
            backgroundColor:
              this.type === 'horizontal-bar'
                ? series.data.map((_, colourIndex) => colours[colourIndex % colours.length])
                : colours[index % colours.length],
            hoverBackgroundColor:
              this.type === 'horizontal-bar'
                ? series.data.map((_, colourIndex) => colours[colourIndex % colours.length])
                : colours[index % colours.length],
            borderWidth: 0,
            barPercentage: isStacked ? 0.72 : 0.68,
            categoryPercentage: isStacked ? 0.8 : 0.72,
          }));

    const configuration: ChartConfiguration<'bar' | 'doughnut' | 'pie' | 'line', number[], string> =
      {
        type: isCircular ? (this.type === 'pie' ? 'pie' : 'doughnut') : isLine ? 'line' : 'bar',
        data: { labels: this.labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          indexAxis: isCircular || isLine ? undefined : 'y',
          cutout: isGauge ? '70%' : this.type === 'donut' ? '58%' : undefined,
          rotation: isGauge ? -90 : undefined,
          circumference: isGauge ? 180 : undefined,
          plugins: {
            tooltip: {
              backgroundColor: styles.getPropertyValue('--color-bg-elevated').trim(),
              titleColor: styles.getPropertyValue('--color-text-primary').trim(),
              bodyColor: styles.getPropertyValue('--color-text-primary').trim(),
              borderColor: styles.getPropertyValue('--color-border-default').trim(),
              borderWidth: 1,
            },
            legend: {
              display: !isGauge && (isCircular || this.type !== 'horizontal-bar'),
              position: this.legendPosition,
              labels: {
                boxWidth: 48,
                boxHeight: 12,
                color: styles.getPropertyValue('--color-chart-label').trim(),
                font: { family: styles.getPropertyValue('--font-family-primary').trim(), size: 14 },
                padding: 12,
              },
            },
          },
          scales: isCircular
            ? undefined
            : isLine
              ? {
                  x: {
                    border: { color: styles.getPropertyValue('--color-chart-axis').trim() },
                    grid: { display: false },
                    ticks: { color: styles.getPropertyValue('--color-chart-label').trim() },
                  },
                  y: {
                    beginAtZero: true,
                    border: { color: styles.getPropertyValue('--color-chart-axis').trim() },
                    grid: { color: styles.getPropertyValue('--color-chart-grid').trim() },
                    ticks: { color: styles.getPropertyValue('--color-chart-label').trim() },
                  },
                }
              : {
                  x: {
                    beginAtZero: true,
                    stacked: isStacked,
                    border: { color: styles.getPropertyValue('--color-chart-axis').trim() },
                    grid: { display: false },
                    ticks: { color: styles.getPropertyValue('--color-chart-label').trim() },
                  },
                  y: {
                    stacked: isStacked,
                    border: { color: styles.getPropertyValue('--color-chart-axis').trim() },
                    grid: { display: false },
                    ticks: { color: styles.getPropertyValue('--color-chart-label').trim() },
                  },
                },
        },
      };

    this.chart = new Chart(this.canvas.nativeElement, configuration);
  }
}
