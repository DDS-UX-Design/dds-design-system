import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { DdsIconName, IconComponent } from '../icon/icon.component';

export interface NavTabItem {
  /** Unique, stable value within this group. */
  value: string;
  label: string;
  icon?: DdsIconName;
  disabled?: boolean;
  /** ID of the content panel rendered by the consumer. */
  panelId?: string;
}

let nextNavTabId = 0;

/** Figma nav tabs for switching between related content panels. */
@Component({
  selector: 'dds-nav-tab',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './nav-tab.component.html',
  styleUrl: './nav-tab.component.css',
})
export class NavTabComponent {
  /** Supply a stable, page-unique ID when linking panels or server rendering. */
  @Input() id = `dds-nav-tab-${nextNavTabId++}`;
  @Input() items: NavTabItem[] = [];
  /** Falls back to the first enabled tab when absent, removed, or disabled. */
  @Input() selectedValue = '';
  @Input() size: 'desktop' | 'mobile' = 'desktop';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() ariaLabel = 'Content tabs';
  /** Arrow keys move focus; Enter or Space activates by default. */
  @Input() activation: 'manual' | 'automatic' = 'manual';
  @Output() selectedValueChange = new EventEmitter<string>();

  @ViewChildren('tabButton') private buttons!: QueryList<ElementRef<HTMLButtonElement>>;
  private focusedValue: string | null = null;

  get activeValue(): string | undefined {
    return (
      this.items.find((item) => item.value === this.selectedValue && !item.disabled)?.value ??
      this.items.find((item) => !item.disabled)?.value
    );
  }

  get focusValue(): string | undefined {
    return (
      this.items.find((item) => item.value === this.focusedValue && !item.disabled)?.value ??
      this.activeValue
    );
  }

  tabId(value: string): string {
    return `${this.id}-tab-${encodeURIComponent(value)}`;
  }

  select(item: NavTabItem): void {
    if (item.disabled) return;
    this.focusedValue = item.value;
    if (item.value === this.activeValue) return;
    this.selectedValue = item.value;
    this.selectedValueChange.emit(item.value);
  }

  onFocus(item: NavTabItem): void {
    this.focusedValue = item.value;
  }

  onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.focusedValue = null;
    }
  }

  onKeydown(event: KeyboardEvent, item: NavTabItem): void {
    if (event.altKey || event.ctrlKey || event.metaKey || item.disabled) return;
    const previous = this.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const next = this.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    if (![previous, next, 'Home', 'End'].includes(event.key)) return;
    const enabled = this.items.filter((tab) => !tab.disabled);
    if (!enabled.length) return;
    event.preventDefault();
    const index = enabled.indexOf(item);
    const targetIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : (index + (event.key === next ? 1 : -1) + enabled.length) % enabled.length;
    const target = enabled[targetIndex];
    this.focusedValue = target.value;
    const button = this.buttons.get(this.items.indexOf(target))?.nativeElement;
    button?.focus({ preventScroll: true });
    button?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    if (this.activation === 'automatic') this.select(target);
  }
}
