import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
} from '@angular/core';

export type StepsOrientation = 'horizontal' | 'vertical';
export type StepsState = 'complete' | 'current' | 'upcoming' | 'error';
export interface StepsItem {
  label: string;
  /** Optional saved-state override. The current item stays current unless it has an error. */
  status?: Exclude<StepsState, 'current'>;
  /** Only completed items render this as a native link. The application owns safe navigation. */
  href?: string;
}

/** Ordered process progress; validation, saved data and navigation belong to the application. */
@Component({
  selector: 'dds-steps',
  standalone: true,
  templateUrl: './steps.component.html',
  styleUrl: './steps.component.css',
  host: { '[style.width.px]': 'orientation === "horizontal" ? horizontalWidth : 584' },
})
export class StepsComponent implements AfterViewInit, OnDestroy {
  @Input() items: readonly StepsItem[] = [];
  /** One-based stage position, bounded to the available items. */
  @Input() currentStep = 1;
  @Input() orientation: StepsOrientation = 'horizontal';
  @Input() ariaLabel = 'Process progress';

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private availableWidth = Infinity;
  private resizeObserver?: ResizeObserver;

  readonly statusLabels: Record<StepsState, string> = {
    complete: 'Completed',
    current: 'In progress',
    upcoming: 'Not started',
    error: 'Needs attention',
  };

  get horizontalWidth(): number {
    return this.items.length * 128 + Math.max(0, this.items.length - 1) * 24;
  }

  get layout(): StepsOrientation {
    return this.orientation === 'horizontal' &&
      this.availableWidth > 0 &&
      this.availableWidth + 0.5 < this.horizontalWidth
      ? 'vertical'
      : this.orientation;
  }

  get position(): number {
    if (!this.items.length) return 0;
    const requested = Number.isFinite(this.currentStep) ? Math.trunc(this.currentStep) : 1;
    return Math.min(this.items.length, Math.max(1, requested));
  }

  get remaining(): number {
    return Math.max(0, this.items.length - this.position);
  }

  get positionLabel(): string {
    return this.orientation === 'vertical' ? 'Stage' : 'Step';
  }

  stateAt(index: number): StepsState {
    const status = this.items[index]?.status;
    if (index === this.position - 1) return status === 'error' ? 'error' : 'current';
    return status ?? (index < this.position - 1 ? 'complete' : 'upcoming');
  }

  ngAfterViewInit(): void {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver((entries) => {
      const previous = this.layout;
      this.availableWidth = entries[0]?.contentRect.width ?? this.availableWidth;
      if (previous !== this.layout) this.changeDetector.markForCheck();
    });
    this.resizeObserver.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
