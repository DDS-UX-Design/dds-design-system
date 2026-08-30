import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DdsIconName, IconComponent } from '../icon/icon.component';

export interface SidebarNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: DdsIconName;
  disabled?: boolean;
  children?: SidebarNavItem[];
}

/** A persistent application sidebar with one level of expandable navigation groups. */
@Component({
  selector: 'dds-sidebar-nav',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './sidebar-nav.component.html',
  styleUrl: './sidebar-nav.component.css',
})
export class SidebarNavComponent {
  @Input() title = 'DDS Enterprise';
  @Input() footer = 'Version 1.0.0';
  @Input() ariaLabel = 'Primary navigation';
  @Input() items: SidebarNavItem[] = [];
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
    return `dds-sidebar-nav-${item.id}-submenu`;
  }

  toggle(item: SidebarNavItem): void {
    if (item.disabled) return;

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
