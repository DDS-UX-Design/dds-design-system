import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

export type SearchSize = 'large' | 'small';
export type SearchState = 'default' | 'focused';

let nextSearchId = 0;

/**
 * A search field with optional suggestions and accessible combobox keyboard behavior.
 */
@Component({
  selector: 'dds-search',
  standalone: true,
  imports: [CommonModule, IconComponent, SkeletonComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnDestroy {
  /** Unique ID used to associate the label, input, and suggestions. */
  @Input() inputId = `dds-search-${nextSearchId++}`;

  /** Visible field label. */
  @Input() label = 'Search';

  /** Current search query. */
  @Input() value = '';

  /** Placeholder shown when the query is empty. */
  @Input() placeholder = 'Search...';

  /** Responsive size from the DDS specification. */
  @Input() size: SearchSize = 'large';

  /** Deterministic focus treatment for documentation previews. */
  @Input() state: SearchState = 'default';

  /** Marks the native search field as required. */
  @Input() required = false;

  /** Shows the visible label. */
  @Input() showLabel = true;

  /** Accessible name used when the visible label is hidden. */
  @Input() ariaLabel = 'Search';

  /** Suggestions displayed while the combobox is expanded. */
  @Input() suggestions: string[] = [];

  /** Opens the suggestions menu for controlled previews. */
  @Input() expanded = false;

  /** Replaces the label and search field with shape-matched skeletons while loading. */
  @Input() loading = false;

  /** Emitted whenever the query changes. */
  @Output() valueChange = new EventEmitter<string>();

  /** Emitted when the user submits the current query. */
  @Output() search = new EventEmitter<string>();

  /** Emitted when the user chooses a suggestion. */
  @Output() suggestionSelected = new EventEmitter<string>();

  hasNativeFocus = false;
  activeIndex = -1;
  private closeTimer?: ReturnType<typeof setTimeout>;

  get isFocused(): boolean {
    return this.hasNativeFocus || this.state === 'focused';
  }

  get isExpanded(): boolean {
    return !this.loading && this.expanded && this.suggestions.length > 0;
  }

  get listboxId(): string {
    return `${this.inputId}-suggestions`;
  }

  get activeOptionId(): string | null {
    return this.activeIndex >= 0 ? `${this.inputId}-option-${this.activeIndex}` : null;
  }

  handleInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
    this.expanded = this.suggestions.length > 0;
    this.activeIndex = -1;
  }

  handleFocus(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }

    this.hasNativeFocus = true;
    this.expanded = this.suggestions.length > 0;
  }

  handleBlur(): void {
    this.hasNativeFocus = false;
    this.closeTimer = setTimeout(() => {
      this.expanded = false;
      this.activeIndex = -1;
    });
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && this.suggestions.length) {
      event.preventDefault();
      this.expanded = true;
      this.activeIndex = (this.activeIndex + 1) % this.suggestions.length;
      return;
    }

    if (event.key === 'ArrowUp' && this.suggestions.length) {
      event.preventDefault();
      this.expanded = true;
      this.activeIndex = this.activeIndex <= 0 ? this.suggestions.length - 1 : this.activeIndex - 1;
      return;
    }

    if (event.key === 'Escape') {
      this.expanded = false;
      this.activeIndex = -1;
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (this.isExpanded && this.activeIndex >= 0) {
        this.selectSuggestion(this.suggestions[this.activeIndex]);
      } else {
        this.search.emit(this.value.trim());
        this.expanded = false;
      }
    }
  }

  selectSuggestion(suggestion: string): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }

    this.value = suggestion;
    this.valueChange.emit(suggestion);
    this.suggestionSelected.emit(suggestion);
    this.expanded = false;
    this.activeIndex = -1;
  }

  ngOnDestroy(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
  }
}
