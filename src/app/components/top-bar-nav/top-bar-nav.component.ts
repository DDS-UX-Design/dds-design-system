import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

let topBarNavId = 0;

/** A dashboard header with a page title, notification and cart actions, and an account menu. */
@Component({
  selector: 'dds-top-bar-nav',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './top-bar-nav.component.html',
  styleUrl: './top-bar-nav.component.css',
})
export class TopBarNavComponent {
  private readonly instanceId = topBarNavId++;

  @Input() pageTitle = 'Page title';
  @Input() showNotifications = true;
  @Input() notificationCount = 100;
  @Input() showCart = true;
  @Input() cartCount = 3;
  @Input() showCounts = true;
  @Input() userInitials = 'JB';
  @Input() userName = 'User account';
  @Input() menuItems: string[] = ['Profile', 'Settings', 'Sign out'];
  @Input() menuOpen = false;

  @Output() notificationClick = new EventEmitter<void>();
  @Output() cartClick = new EventEmitter<void>();
  @Output() menuOpenChange = new EventEmitter<boolean>();
  @Output() menuItemSelect = new EventEmitter<string>();

  readonly menuId = `dds-top-bar-nav-menu-${this.instanceId}`;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  formatCount(count: number): string {
    return count > 99 ? '99+' : Math.max(0, count).toString();
  }

  toggleMenu(): void {
    this.setMenuOpen(!this.menuOpen);
  }

  selectMenuItem(item: string): void {
    this.menuItemSelect.emit(item);
    this.setMenuOpen(false);
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (this.menuOpen && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.setMenuOpen(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.menuOpen) this.setMenuOpen(false);
  }

  private setMenuOpen(open: boolean): void {
    this.menuOpen = open;
    this.menuOpenChange.emit(open);
  }
}
