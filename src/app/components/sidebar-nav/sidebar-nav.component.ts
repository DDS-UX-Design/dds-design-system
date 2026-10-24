import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  HostBinding,
  HostListener,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { DdsIconName, IconComponent } from '../icon/icon.component';

export interface SidebarNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: DdsIconName;
  disabled?: boolean;
  children?: SidebarNavItem[];
}

let nextSidebarId = 0;

/** A persistent application sidebar with one level of expandable navigation groups. */
@Component({
  selector: 'dds-sidebar-nav',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './sidebar-nav.component.html',
  styleUrl: './sidebar-nav.component.css',
})
export class SidebarNavComponent implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private themeObserver?: MutationObserver;
  private darkLogo = false;

  /** Only the default artwork changes with the nearest theme; supplied logos are preserved. */
  get resolvedLogoSrc(): string {
    return this.logoSrc === 'images/dds-brand-icon.svg' && !this.darkLogo
      ? 'images/dds-brand-icon-light.svg'
      : this.logoSrc;
  }

  ngOnInit(): void {
    const updateLogo = () => {
      this.darkLogo =
        this.host.nativeElement.closest?.('[data-theme]')?.getAttribute('data-theme') === 'dark';
      this.changeDetector.markForCheck();
    };
    updateLogo();
    if (typeof MutationObserver === 'undefined') return;
    this.themeObserver = new MutationObserver(updateLogo);
    let ancestor: HTMLElement | null = this.host.nativeElement;
    while (ancestor) {
      this.themeObserver.observe(ancestor, { attributes: true, attributeFilter: ['data-theme'] });
      ancestor = ancestor.parentElement;
    }
  }

  ngOnDestroy(): void {
    this.themeObserver?.disconnect();
  }

  readonly navigationId = `dds-sidebar-nav-${nextSidebarId++}`;
  @HostBinding('class.dds-sidebar-nav--collapsed')
  @Input()
  collapsed = false;
  @Input() logoSrc = 'images/dds-brand-icon.svg';
  @Output() collapsedChange = new EventEmitter<boolean>();
  tooltip?: { label: string; top: number; left: number };

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.tooltip = undefined;
    this.collapsedChange.emit(this.collapsed);
  }

  @HostListener('document:keydown.escape')
  dismissTooltip(): void {
    this.tooltip = undefined;
  }

  showTooltip(item: SidebarNavItem, event: Event): void {
    if (!this.collapsed) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.tooltip = { label: item.label, top: rect.top + rect.height / 2, left: rect.right + 8 };
  }

  @Input() title = 'DDS Enterprise';
  @Input() footer = 'Version 1.0.0';
  @Input() ariaLabel = 'Primary navigation';
  @Input() items: SidebarNavItem[] = [];
  /** Secondary destinations below the divider, matching Figma's Bottom Menu Items slot. */
  @Input() bottomItems: SidebarNavItem[] = [];
  @Input() activeItemId?: string;
  @Input() expandedIds: string[] = [];

  @Output() activeItemIdChange = new EventEmitter<string>();
  @Output() expandedIdsChange = new EventEmitter<string[]>();
  @Output() itemSelect = new EventEmitter<SidebarNavItem>();

  isExpanded(item: SidebarNavItem): boolean {
    return this.expandedIds.includes(item.id);
  }

  isActive(item: SidebarNavItem): boolean {
    return this.activeItemId === item.id;
  }

  hasActiveChild(item: SidebarNavItem): boolean {
    return Boolean(item.children?.some((child) => child.id === this.activeItemId));
  }

  submenuId(item: SidebarNavItem): string {
    return `${this.navigationId}-${item.id}-submenu`;
  }

  toggle(item: SidebarNavItem): void {
    if (item.disabled) return;

    if (this.collapsed) {
      this.toggleCollapsed();
      if (this.isExpanded(item)) return;
    }

    const expanded = this.isExpanded(item);
    this.expandedIds = expanded
      ? this.expandedIds.filter((id) => id !== item.id)
      : [...this.expandedIds, item.id];
    this.expandedIdsChange.emit(this.expandedIds);
  }

  select(item: SidebarNavItem, event?: Event): void {
    if (item.disabled) {
      event?.preventDefault();
      return;
    }

    this.activeItemId = item.id;
    this.activeItemIdChange.emit(item.id);
    this.itemSelect.emit(item);
  }
}
