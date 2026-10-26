import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  Directive,
  ElementRef,
  EnvironmentInjector,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { TooltipComponent } from './tooltip.component';
import { positionTooltip, TooltipPlacement } from './tooltip-position';

/** Supplementary help for one focusable control, including the native control inside dds-button. */
@Directive({ selector: '[ddsTooltip]', standalone: true })
export class TooltipDirective implements OnChanges, OnDestroy {
  @Input('ddsTooltip') text = '';
  @Input() tooltipPlacement: TooltipPlacement = 'top';
  @Input() tooltipContent: 'short' | 'multiline' = 'short';
  @Input() tooltipShowArrow = true;
  @Input() tooltipDisabled = false;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly application = inject(ApplicationRef);
  private readonly environment = inject(EnvironmentInjector);
  private ref?: ComponentRef<TooltipComponent>;
  private trigger?: HTMLElement;
  private hovered = false;
  private focused = false;
  private bubbleHovered = false;
  private dismissed = false;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private cleanups: (() => void)[] = [];

  ngOnChanges(): void {
    if (this.blocked()) this.close();
    else if (this.ref) {
      this.configure();
      this.position();
    } else if (this.focused || this.hovered) this.show();
  }

  ngOnDestroy(): void {
    this.close();
  }

  @HostListener('pointerenter', ['$event'])
  onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    if (!this.focused && !this.hovered) this.dismissed = false;
    this.hovered = true;
    this.show();
  }

  @HostListener('pointerleave')
  onPointerLeave(): void {
    this.hovered = false;
    this.scheduleClose();
  }

  @HostListener('focusin')
  onFocus(): void {
    if (!this.hovered && !this.focused) this.dismissed = false;
    this.focused = true;
    this.show();
  }

  @HostListener('focusout')
  onBlur(): void {
    this.focused = false;
    this.scheduleClose();
  }

  onEscape(): void {
    if (!this.ref) return;
    this.dismissed = true;
    this.close();
  }

  private control(): HTMLElement {
    return (
      this.host.querySelector<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]',
      ) ?? this.host
    );
  }

  private blocked(): boolean {
    const control = this.control();
    return (
      this.tooltipDisabled ||
      !this.text.trim() ||
      control.matches(':disabled') ||
      control.getAttribute('aria-disabled') === 'true' ||
      !!control.closest('[inert], [hidden]')
    );
  }

  private show(): void {
    clearTimeout(this.closeTimer);
    if (this.ref || this.dismissed || this.blocked()) return;
    const window = this.host.ownerDocument.defaultView;
    if (!window) return;
    this.trigger = this.control();
    const ref = createComponent(TooltipComponent, { environmentInjector: this.environment });
    this.ref = ref;
    this.configure();
    const element = ref.location.nativeElement as HTMLElement;
    Object.assign(element.style, {
      position: 'fixed',
      inset: 'auto',
      visibility: 'hidden',
      zIndex: '1000',
    });
    element.style.setProperty('--tooltip-bridge', '4px');
    this.moveIntoTheme();
    this.application.attachView(ref.hostView);
    ref.changeDetectorRef.detectChanges();
    if (typeof element.showPopover === 'function') {
      element.setAttribute('popover', 'manual');
      element.showPopover();
    }
    this.linkDescription();
    const enter = () => {
      this.bubbleHovered = true;
      clearTimeout(this.closeTimer);
    };
    const leave = () => {
      this.bubbleHovered = false;
      this.scheduleClose();
    };
    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointerleave', leave);
    const update = () => this.position();
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      this.onEscape();
    };
    this.host.ownerDocument.addEventListener('keydown', escape, true);
    window.addEventListener('resize', update);
    this.host.ownerDocument.addEventListener('scroll', update, true);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    this.cleanups.push(() => {
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointerleave', leave);
      this.host.ownerDocument.removeEventListener('keydown', escape, true);
      window.removeEventListener('resize', update);
      this.host.ownerDocument.removeEventListener('scroll', update, true);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    });
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(update);
      observer.observe(this.trigger);
      observer.observe(element);
      this.cleanups.push(() => observer.disconnect());
    }
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => !entry.isIntersecting)) this.close();
      });
      observer.observe(this.trigger);
      this.cleanups.push(() => observer.disconnect());
    }
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => {
        if (!this.trigger?.isConnected || this.control() !== this.trigger || this.blocked())
          this.close();
        else {
          this.linkDescription();
          this.moveIntoTheme();
          this.position();
        }
      });
      observer.observe(this.host, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'aria-disabled', 'aria-describedby'],
      });
      const themes = new MutationObserver(() => {
        if (this.blocked()) this.close();
        else {
          this.moveIntoTheme();
          this.position();
        }
      });
      for (
        let ancestor: HTMLElement | null = this.host;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        themes.observe(ancestor, {
          attributes: true,
          attributeFilter: ['data-theme', 'class', 'style', 'hidden', 'inert'],
        });
      }
      this.cleanups.push(() => {
        observer.disconnect();
        themes.disconnect();
      });
    }
    this.position();
  }

  private configure(): void {
    this.ref?.setInput('text', this.text);
    this.ref?.setInput('content', this.tooltipContent);
    this.ref?.setInput('showArrow', this.tooltipShowArrow);
    this.ref?.setInput('placement', this.tooltipPlacement);
  }

  private linkDescription(): void {
    if (!this.ref || !this.trigger) return;
    const ids = this.trigger.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean) ?? [];
    if (!ids.includes(this.ref.instance.tooltipId)) {
      this.trigger.setAttribute(
        'aria-describedby',
        [...ids, this.ref.instance.tooltipId].join(' '),
      );
    }
  }

  private moveIntoTheme(): void {
    if (!this.ref || !this.trigger) return;
    const element = this.ref.location.nativeElement as HTMLElement;
    const theme = this.trigger.closest<HTMLElement>('[data-theme]');
    // Keep supplementary text out of native controls and their naming labels.
    let parent = theme === this.trigger ? theme.parentElement : theme;
    const namingContainer = parent?.closest('label, button, a[href]');
    const copyTheme = theme === this.trigger || !!namingContainer?.contains(this.trigger);
    if (namingContainer?.contains(this.trigger)) parent = namingContainer.parentElement;
    const dialog = this.trigger.closest<HTMLElement>(
      'dialog, [role="dialog"], [role="alertdialog"]',
    );
    // Stay in a modal's active subtree while still inheriting its enclosing theme.
    if (dialog && (!parent || parent.contains(dialog))) parent = dialog;
    const destination = parent ?? this.host.ownerDocument.body;
    const roles = ['--color-bg-inverse', '--color-text-inverse', '--color-effect-shadow'];
    for (const role of roles) {
      if (copyTheme) {
        element.style.setProperty(
          role,
          this.host.ownerDocument
            .defaultView!.getComputedStyle(this.trigger)
            .getPropertyValue(role),
        );
      } else element.style.removeProperty(role);
    }
    if (element.parentElement !== destination) {
      destination.appendChild(element);
      if (element.hasAttribute('popover') && !element.matches(':popover-open'))
        element.showPopover();
    }
  }

  private position(): void {
    if (!this.ref || !this.trigger) return;
    if (this.blocked() || !this.trigger.isConnected) {
      this.close();
      return;
    }
    const window = this.host.ownerDocument.defaultView!;
    const visual = window.visualViewport;
    const viewport = {
      left: visual?.offsetLeft ?? 0,
      top: visual?.offsetTop ?? 0,
      right: (visual?.offsetLeft ?? 0) + (visual?.width ?? window.innerWidth),
      bottom: (visual?.offsetTop ?? 0) + (visual?.height ?? window.innerHeight),
    };
    const trigger = this.trigger.getBoundingClientRect();
    if (
      trigger.bottom < viewport.top ||
      trigger.top > viewport.bottom ||
      trigger.right < viewport.left ||
      trigger.left > viewport.right
    ) {
      this.close();
      return;
    }
    const element = this.ref.location.nativeElement as HTMLElement;
    this.ref.changeDetectorRef.detectChanges();
    const surface = element.querySelector<HTMLElement>('.dds-tooltip__surface')!;
    const horizontal = this.tooltipPlacement === 'left' || this.tooltipPlacement === 'right';
    const tail = this.tooltipShowArrow ? 10 : 4;
    surface.style.maxWidth = `${Math.max(0, viewport.right - viewport.left - 16 - (horizontal ? tail : 0))}px`;
    surface.style.maxHeight = `${Math.max(0, viewport.bottom - viewport.top - 16)}px`;
    surface.style.overflowY = 'auto';
    let result = positionTooltip(
      trigger,
      surface.getBoundingClientRect(),
      viewport,
      this.tooltipPlacement,
      this.tooltipShowArrow,
    );
    if (!result.fits) {
      // Keep the trigger uncovered in constrained viewports; never squeeze below a text line.
      if (result.available < 36) {
        this.close();
        return;
      }
      if (horizontal) surface.style.maxWidth = `${result.available}px`;
      else surface.style.maxHeight = `${result.available}px`;
      result = positionTooltip(
        trigger,
        surface.getBoundingClientRect(),
        viewport,
        result.placement,
        this.tooltipShowArrow,
      );
    }
    this.ref.setInput('placement', result.placement);
    this.ref.changeDetectorRef.detectChanges();
    element.style.left = `${result.left}px`;
    element.style.top = `${result.top}px`;
    element.style.setProperty('--tooltip-arrow-offset', `${result.arrowOffset}px`);
    element.style.visibility = 'visible';
  }

  private scheduleClose(): void {
    clearTimeout(this.closeTimer);
    if (!this.hovered && !this.focused && !this.bubbleHovered) {
      this.closeTimer = setTimeout(() => this.close(), 120);
    }
  }

  private close(): void {
    clearTimeout(this.closeTimer);
    this.cleanups.splice(0).forEach((cleanup) => cleanup());
    if (this.ref) {
      const ids =
        this.trigger
          ?.getAttribute('aria-describedby')
          ?.split(/\s+/)
          .filter((id) => id && id !== this.ref!.instance.tooltipId) ?? [];
      if (ids.length) this.trigger?.setAttribute('aria-describedby', ids.join(' '));
      else this.trigger?.removeAttribute('aria-describedby');
      this.application.detachView(this.ref.hostView);
      this.ref.destroy();
      this.ref = undefined;
    }
    this.trigger = undefined;
    this.bubbleHovered = false;
  }
}
