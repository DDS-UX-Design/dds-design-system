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
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--chart-6',
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

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.canvas) this.renderChart();
  }

  ngOnDestroy(): void {
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
              ? [colours[0], styles.getPropertyValue('--grey-200').trim()]
              : colours,
            borderColor: styles.getPropertyValue('--bg-colour-white').trim() || '#fff',
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
            pointBorderColor: styles.getPropertyValue('--bg-colour-white').trim() || '#fff',
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
            legend: {
              display: !isGauge && (isCircular || this.type !== 'horizontal-bar'),
              position: this.legendPosition,
              labels: {
                boxWidth: 48,
                boxHeight: 12,
                color: styles.getPropertyValue('--text-colour-default').trim(),
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
                    border: { color: '#d4d4d4' },
                    grid: { display: false },
                    ticks: { color: '#171717' },
                  },
                  y: {
                    beginAtZero: true,
                    border: { color: '#d4d4d4' },
                    grid: { color: '#e5e5e5' },
                    ticks: { color: '#171717' },
                  },
                }
              : {
                  x: {
                    beginAtZero: true,
                    stacked: isStacked,
                    border: { color: '#d4d4d4' },
                    grid: { display: false },
                    ticks: { color: '#171717' },
                  },
                  y: {
                    stacked: isStacked,
                    border: { color: '#d4d4d4' },
                    grid: { display: false },
                    ticks: { color: '#171717' },
                  },
                },
        },
      };

    this.chart = new Chart(this.canvas.nativeElement, configuration);
  }
}
