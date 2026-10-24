import { TestBed } from '@angular/core/testing';
import { Chart } from 'chart.js';
import { ChartComponent } from './chart.component';

vi.mock('chart.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('chart.js')>();
  const mock = vi.fn(function () {
    return { destroy: vi.fn() };
  });
  Object.assign(mock, { register: vi.fn() });
  return { ...actual, Chart: mock };
});

describe('Chart semantic colours', () => {
  it('reads chart roles from the canvas scope and redraws when an ancestor theme changes', async () => {
    await TestBed.configureTestingModule({ imports: [ChartComponent] }).compileComponents();
    const styles = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (role: string) => `resolved:${role}`,
    } as CSSStyleDeclaration);
    const fixture = TestBed.createComponent(ChartComponent);
    fixture.componentRef.setInput('type', 'line');
    fixture.detectChanges();
    const chart = vi.mocked(Chart);
    let config = chart.mock.calls.at(-1)![1] as any;
    expect(styles).toHaveBeenCalledWith(fixture.nativeElement.querySelector('canvas'));
    expect(config.data.datasets[0].borderColor).toBe('resolved:--color-chart-categorical-01');
    expect(config.options.scales.y.grid.color).toBe('resolved:--color-chart-grid');
    expect(config.options.scales.x.border.color).toBe('resolved:--color-chart-axis');
    expect(config.options.scales.x.ticks.color).toBe('resolved:--color-chart-label');
    expect(config.options.plugins.tooltip.bodyColor).toBe('resolved:--color-text-primary');
    const before = chart.mock.calls.length;
    fixture.nativeElement.setAttribute('data-theme', 'dark');
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(chart.mock.calls.length).toBe(before + 1);
    fixture.componentRef.setInput('type', 'gauge');
    fixture.detectChanges();
    config = chart.mock.calls.at(-1)![1] as any;
    expect(config.data.datasets[0].backgroundColor[1]).toBe('resolved:--color-chart-track');
    fixture.destroy();
    const destroyed = chart.mock.calls.length;
    document.documentElement.setAttribute('data-theme', 'dark');
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(chart.mock.calls.length).toBe(destroyed);
    document.documentElement.removeAttribute('data-theme');
    styles.mockRestore();
  });
});
