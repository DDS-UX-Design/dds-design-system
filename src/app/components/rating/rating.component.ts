import { Component, EventEmitter, Input, Output } from '@angular/core';

export type RatingStyle = 'stars' | 'smileys';
export type RatingSize = 'default' | 'compact';
let nextRatingId = 0;

/** Five-point feedback. Zero is unanswered; selection never submits a form. */
@Component({
  selector: 'dds-rating',
  standalone: true,
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css',
})
export class RatingComponent {
  @Input() inputId = `dds-rating-${nextRatingId++}`;
  @Input() name = this.inputId;
  @Input() value = 0;
  @Input() styleType: RatingStyle = 'stars';
  @Input() size: RatingSize = 'default';
  @Input() label = 'How was your experience?';
  @Input() supportingText = 'Choose one rating.';
  @Input() showLabel = true;
  @Input() showSupportingText = true;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<number>();

  readonly options = [
    { value: 1, label: 'Very dissatisfied', icon: 'angry' },
    { value: 2, label: 'Dissatisfied', icon: 'frown' },
    { value: 3, label: 'Neutral', icon: 'meh' },
    { value: 4, label: 'Satisfied', icon: 'smile' },
    { value: 5, label: 'Very satisfied', icon: 'laugh' },
  ];

  get selectedValue(): number {
    return Number.isInteger(this.value) && this.value >= 0 && this.value <= 5 ? this.value : 0;
  }

  get summary(): string {
    return this.selectedValue
      ? `${this.selectedValue} of 5 · ${this.options[this.selectedValue - 1].label}`
      : 'Not rated';
  }

  isHighlighted(value: number): boolean {
    return this.styleType === 'stars' ? value <= this.selectedValue : value === this.selectedValue;
  }

  iconUrl(option: (typeof this.options)[number]): string {
    const shape =
      this.styleType === 'smileys'
        ? option.icon
        : this.isHighlighted(option.value)
          ? 'star-filled'
          : 'star';
    return `url("images/rating/${shape}${this.size === 'compact' ? '-compact' : ''}.svg")`;
  }

  select(value: number): void {
    if (this.disabled || value === this.selectedValue) return;
    this.value = value;
    this.valueChange.emit(value);
  }
}
