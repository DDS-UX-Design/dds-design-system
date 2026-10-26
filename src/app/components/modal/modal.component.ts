import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  ViewChild,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';

export type ModalIntent = 'standard' | 'destructive';
export type ModalState = 'default' | 'submitting' | 'error';
export type ModalDismissReason = 'close' | 'secondary' | 'escape' | 'backdrop';
let nextModalId = 0;

/** Native modal dialog. The application owns requests and closes only after confirmed success. */
@Component({
  selector: 'dds-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Input() title = 'Confirm action';
  @Input() message = '';
  @Input() intent: ModalIntent = 'standard';
  @Input() state: ModalState = 'default';
  @Input() primaryLabel = 'Confirm';
  @Input() secondaryLabel = 'Cancel';
  @Input() submittingLabel = 'Saving…';
  @Input() submittingMessage = 'Saving… Keep this window open.';
  @Input() errorMessage =
    'The action could not be completed. Your changes are preserved. Try again.';
  @Input() showContent = true;
  /** Opt in only for a simple standard confirmation, never for a data-entry dialog. */
  @Input() closeOnBackdrop = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<ModalDismissReason>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('heading') private heading?: ElementRef<HTMLElement>;
  readonly id = `dds-modal-${++nextModalId}`;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly mediaQuery =
    this.browser && typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 599px)')
      : undefined;
  readonly mobile = signal(this.mediaQuery?.matches ?? false);
  private readonly onMediaChange = (event: MediaQueryListEvent) => this.mobile.set(event.matches);
  private ready = false;
  private invoker?: HTMLElement;
  private previousOverflow?: string;
  private backdropPointer = false;

  get submitting(): boolean {
    return this.state === 'submitting';
  }

  ngAfterViewInit(): void {
    this.mediaQuery?.addEventListener('change', this.onMediaChange);
    this.ready = true;
    this.syncDialog();
  }

  ngOnChanges(): void {
    if (this.ready) this.syncDialog();
  }

  ngOnDestroy(): void {
    this.open = false;
    this.mediaQuery?.removeEventListener('change', this.onMediaChange);
    this.closeDialog();
  }

  confirm(): void {
    if (!this.open || this.submitting) return;
    this.confirmed.emit();
  }

  dismiss(reason: ModalDismissReason): void {
    if (!this.open || this.submitting) return;
    if (reason === 'backdrop' && (!this.closeOnBackdrop || this.intent === 'destructive')) return;
    this.open = false;
    this.closeDialog();
    this.openChange.emit(false);
    this.cancelled.emit(reason);
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.dismiss('escape');
  }

  onNativeClose(): void {
    // Covers native close methods in projected content. Normal closing already set open=false.
    if (!this.open || this.dialog?.nativeElement.open) return;
    if (this.submitting) {
      this.dialog?.nativeElement.showModal();
      this.heading?.nativeElement.focus();
      return;
    }
    this.open = false;
    this.releaseBackground();
    this.openChange.emit(false);
  }

  onPointerDown(event: PointerEvent): void {
    this.backdropPointer = this.outsideDialog(event);
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.backdropPointer && this.outsideDialog(event)) this.dismiss('backdrop');
    this.backdropPointer = false;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.dismiss('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const dialog = this.dialog!.nativeElement;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]'),
    ).filter(
      (element) =>
        element.tabIndex >= 0 &&
        !element.matches(':disabled') &&
        !element.closest('[hidden], [inert]') &&
        getComputedStyle(element).visibility !== 'hidden' &&
        getComputedStyle(element).display !== 'none',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = dialog.ownerDocument.activeElement;
    if (!first) {
      event.preventDefault();
      this.heading?.nativeElement.focus();
    } else if (event.shiftKey && (active === first || !focusable.includes(active as HTMLElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !focusable.includes(active as HTMLElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  private syncDialog(): void {
    if (!this.browser || !this.dialog) return;
    const dialog = this.dialog.nativeElement;
    if (this.open && !dialog.open) {
      const document = dialog.ownerDocument;
      this.invoker =
        document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
      // Native showModal makes the rest of the document inert and provides the top layer.
      dialog.showModal();
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Heading is a stable focus target, even while all actions are disabled.
      if (this.intent === 'destructive' && !this.submitting) {
        dialog.querySelector<HTMLButtonElement>('[data-secondary] button')?.focus();
      } else this.heading?.nativeElement.focus();
    } else if (!this.open && dialog.open) this.closeDialog();
    if (this.open && this.submitting) this.heading?.nativeElement.focus();
  }

  private closeDialog(): void {
    const dialog = this.dialog?.nativeElement;
    if (dialog?.open) dialog.close();
    this.releaseBackground();
  }

  private releaseBackground(): void {
    if (this.previousOverflow === undefined) return;
    const document = this.dialog!.nativeElement.ownerDocument;
    document.body.style.overflow = this.previousOverflow;
    this.previousOverflow = undefined;
    if (this.invoker?.isConnected) this.invoker.focus({ preventScroll: true });
    this.invoker = undefined;
  }

  private outsideDialog(event: MouseEvent): boolean {
    const dialog = this.dialog!.nativeElement;
    if (event.target !== dialog) return false;
    const box = dialog.getBoundingClientRect();
    return (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    );
  }
}
