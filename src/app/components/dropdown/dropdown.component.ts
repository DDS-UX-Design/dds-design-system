import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { DropdownDirection, positionDropdown } from './dropdown-position';

export type DropdownItem = {
  label: string;
  styleType?: 'default' | 'danger';
  disabled?: boolean;
  separatorBefore?: boolean;
};
let nextDropdownId = 0;

/** Contextual actions, not form-value selection. Uses the top layer to escape table clipping. */
@Component({
  selector: 'dds-dropdown',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() items: DropdownItem[] = [];
  @Input() triggerLabel = 'Actions';
  @Input() iconOnly = false;
  @Input() direction: DropdownDirection = 'down';
  @Input() align: 'start' | 'end' = 'start';
  @Input() disabled = false;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() itemSelect = new EventEmitter<DropdownItem>();

  @ViewChild('trigger') private trigger!: ElementRef<HTMLButtonElement>;
  @ViewChild('menu') private menu!: ElementRef<HTMLElement>;
  readonly id = `dds-dropdown-${nextDropdownId++}`;
  actualDirection: DropdownDirection = 'down';
  activeIndex = -1;
  private ready = false;
  private popoverVisible = false;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly onScroll = (event: Event) => {
    if (this.open && !this.menu.nativeElement.contains(event.target as Node)) this.close(false);
  };

  ngAfterViewInit(): void {
    this.ready = true;
    if (this.browser)
      this.menu.nativeElement.ownerDocument.addEventListener('scroll', this.onScroll, true);
    this.syncSurface();
  }

  ngOnChanges(): void {
    if (!this.ready) return;
    if (this.open && (this.disabled || !this.items.length)) this.close(false);
    else this.syncSurface();
  }

  ngOnDestroy(): void {
    if (!this.ready) return;
    this.menu.nativeElement.ownerDocument.removeEventListener('scroll', this.onScroll, true);
    if (this.popoverVisible) this.menu.nativeElement.hidePopover();
  }

  toggle(): void {
    if (this.open) this.close(true);
    else this.show('first');
  }

  show(focus: 'first' | 'last'): void {
    if (this.disabled || !this.items.length) return;
    const changed = !this.open;
    this.open = true;
    this.syncSurface();
    this.focusItem(focus === 'first' ? this.enabledIndices[0] : this.enabledIndices.at(-1));
    if (changed) this.openChange.emit(true);
  }

  close(restoreFocus: boolean): void {
    if (!this.open) return;
    this.open = false;
    this.activeIndex = -1;
    this.syncSurface();
    if (restoreFocus) this.trigger.nativeElement.focus();
    this.openChange.emit(false);
  }

  select(item: DropdownItem): void {
    if (!this.open || this.disabled || item.disabled) return;
    // Restore focus before emitting: the application may open a confirmation dialog.
    this.close(true);
    this.itemSelect.emit(item);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.show(event.key === 'ArrowUp' ? 'last' : 'first');
    } else if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      this.close(true);
    }
  }

  onMenuKeydown(event: KeyboardEvent): void {
    const indices = this.enabledIndices;
    const current = indices.indexOf(this.activeIndex);
    let target: number | undefined;
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close(true);
        return;
      case 'Tab':
        // Continue native tab order from the invoker, never trap focus in the menu.
        this.close(true);
        return;
      case 'ArrowDown':
        target = indices[(current + 1) % indices.length];
        break;
      case 'ArrowUp':
        target = indices[(current - 1 + indices.length) % indices.length];
        break;
      case 'Home':
        target = indices[0];
        break;
      case 'End':
        target = indices.at(-1);
        break;
      default:
        return; // Native buttons implement Enter and Space activation.
    }
    event.preventDefault();
    this.focusItem(target);
  }

  @HostListener('document:pointerdown', ['$event'])
  onOutsidePointer(event: PointerEvent): void {
    if (
      this.open &&
      !this.menu.nativeElement.contains(event.target as Node) &&
      !this.trigger.nativeElement.contains(event.target as Node)
    )
      this.close(true);
  }

  @HostListener('document:focusin', ['$event'])
  onOutsideFocus(event: FocusEvent): void {
    if (
      this.open &&
      !this.menu.nativeElement.contains(event.target as Node) &&
      event.target !== this.trigger.nativeElement
    )
      this.close(false);
  }

  @HostListener('window:resize')
  reposition(): void {
    if (!this.open || !this.browser) return;
    const surface = this.menu.nativeElement;
    // Measure the unconstrained list to allow flipping after a viewport resize.
    surface.style.maxHeight = '';
    surface.style.width = `${Math.min(248, Math.max(0, window.innerWidth - 16))}px`;
    const pos = positionDropdown(
      this.trigger.nativeElement.getBoundingClientRect(),
      { width: 248, height: surface.scrollHeight + 2 },
      { width: window.innerWidth, height: window.innerHeight },
      this.direction,
      this.align,
    );
    Object.assign(surface.style, {
      left: `${pos.left}px`,
      top: `${pos.top}px`,
      width: `${pos.width}px`,
      maxHeight: `${pos.maxHeight}px`,
    });
    this.actualDirection = pos.direction;
  }

  private get enabledIndices(): number[] {
    return this.items.flatMap((item, index) => (item.disabled ? [] : [index]));
  }

  private focusItem(index: number | undefined): void {
    this.activeIndex = index ?? -1;
    this.cdr.detectChanges();
    if (index === undefined) this.menu.nativeElement.focus();
    else
      this.menu.nativeElement
        .querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
        [index]?.focus();
  }

  private syncSurface(): void {
    if (!this.ready || !this.browser) return;
    if (this.disabled || !this.items.length) this.open = false;
    this.cdr.detectChanges();
    const surface = this.menu.nativeElement;
    if (this.open) {
      if (typeof surface.showPopover === 'function' && !this.popoverVisible) {
        surface.showPopover();
        this.popoverVisible = true;
      }
      this.reposition();
    } else if (this.popoverVisible) {
      surface.hidePopover();
      this.popoverVisible = false;
    }
    this.cdr.detectChanges();
  }
}
