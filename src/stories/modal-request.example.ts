import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { ButtonComponent } from '../app/components/button/button.component';
import { ModalComponent, ModalState } from '../app/components/modal/modal.component';
import { TextInputComponent } from '../app/components/text-input/text-input.component';
import { ToastComponent } from '../app/components/toast/toast.component';

/** Bounded, local request simulation; applications own real save/reconciliation logic. */
@Component({
  selector: 'dds-modal-request-example',
  imports: [ModalComponent, ButtonComponent, TextInputComponent, ToastComponent],
  template: `
    <dds-button (click)="open = true">Edit delivery instructions</dds-button>
    <p>This local example fails its first save, retains your input, then succeeds on retry.</p>
    <dds-modal
      [(open)]="open"
      title="Update delivery instructions"
      message="These instructions will be shared with the delivery team."
      primaryLabel="Save changes"
      [state]="state"
      (confirmed)="save()"
    >
      <form (submit)="submit($event)">
        <dds-text-input
          label="Delivery instructions"
          [(value)]="instructions"
          [required]="false"
          [showHelperText]="false"
        />
      </form>
    </dds-modal>
    @if (saved) {
      <dds-toast
        title="Instructions updated"
        message="Delivery instructions saved in this example."
        tone="success"
        (dismissed)="saved = false"
      />
    }
  `,
})
export class ModalRequestExampleComponent implements OnDestroy {
  open = false;
  state: ModalState = 'default';
  instructions = 'Leave at reception.';
  saved = false;
  private attempts = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private readonly changeDetector = inject(ChangeDetectorRef);

  submit(event: Event): void {
    event.preventDefault();
    this.save();
  }

  save(): void {
    if (!this.open || this.state === 'submitting') return;
    this.state = 'submitting';
    this.timer = setTimeout(() => {
      if (++this.attempts === 1) this.state = 'error';
      else {
        this.state = 'default';
        this.open = false;
        this.saved = true;
      }
      this.changeDetector.markForCheck();
    }, 1200);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
