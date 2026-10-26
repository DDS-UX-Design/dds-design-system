import { Component, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import { StepsComponent, StepsItem } from '../app/components/steps/steps.component';
import { ButtonComponent } from '../app/components/button/button.component';
import { TextInputComponent } from '../app/components/text-input/text-input.component';
import { AlertComponent } from '../app/components/alert/alert.component';

/** Example application logic, not part of the Steps component API. */
@Component({
  selector: 'dds-steps-form-example',
  imports: [StepsComponent, ButtonComponent, TextInputComponent, AlertComponent],
  template: `
    <div style="width:584px;max-width:100%;display:grid;gap:24px">
      @if (submitted) {
        <h3 tabindex="-1">Store setup complete</h3>
        <dds-alert
          tone="success"
          text="Your setup has been saved in this example."
          [dismissible]="false"
        />
      } @else {
        <dds-steps [items]="items" [currentStep]="currentStep" ariaLabel="Store setup progress" />
        <section data-stage="1" [hidden]="currentStep !== 1">
          <h3 tabindex="-1">Business details</h3>
          <dds-text-input
            label="Business name"
            [(value)]="businessName"
            [required]="true"
            [state]="error ? 'error' : 'default'"
            errorMessage="Enter your business name before continuing."
          />
        </section>
        <section data-stage="2" [hidden]="currentStep !== 2">
          <h3 tabindex="-1">Locations</h3>
          <dds-text-input
            label="Primary location"
            [(value)]="location"
            [required]="true"
            [state]="error ? 'error' : 'default'"
            errorMessage="Enter a location before continuing."
          />
        </section>
        <section data-stage="3" [hidden]="currentStep !== 3">
          <h3 tabindex="-1">Team</h3>
          <dds-text-input
            label="Team contact"
            [(value)]="contact"
            helperText="Optional. You can invite your team later."
          />
        </section>
        <section data-stage="4" [hidden]="currentStep !== 4">
          <h3 tabindex="-1">Review</h3>
          <p>Business: {{ businessName }}</p>
          <p>Location: {{ location }}</p>
          <p>Your current stage stays in progress until submission succeeds.</p>
        </section>
        <div style="display:flex;gap:12px">
          <dds-button
            variant="secondary"
            size="medium"
            [disabled]="currentStep === 1"
            (click)="back()"
            >Back</dds-button
          >
          <dds-button size="medium" (click)="continue()">{{
            currentStep === 4 ? 'Submit setup' : 'Continue'
          }}</dds-button>
        </div>
      }
    </div>
  `,
})
export class StepsFormExampleComponent {
  currentStep = 1;
  businessName = '';
  location = '';
  contact = '';
  error = false;
  submitted = false;
  private readonly saved = new Set<number>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly changeDetector = inject(ChangeDetectorRef);

  get items(): StepsItem[] {
    return ['Business details', 'Locations', 'Team', 'Review'].map((label, index) => ({
      label,
      status:
        this.currentStep === index + 1 && this.error
          ? 'error'
          : this.saved.has(index + 1)
            ? 'complete'
            : 'upcoming',
    }));
  }

  continue(): void {
    if (this.submitted) return;
    if (
      (this.currentStep === 1 && !this.businessName.trim()) ||
      (this.currentStep === 2 && !this.location.trim())
    ) {
      this.error = true;
      this.changeDetector.detectChanges();
      this.element.nativeElement
        .querySelector<HTMLInputElement>(`[data-stage="${this.currentStep}"] input`)
        ?.focus();
      return;
    }
    this.error = false;
    this.saved.add(this.currentStep);
    if (this.currentStep === 4) this.submitted = true;
    else this.currentStep++;
    this.focusStage();
  }

  back(): void {
    if (this.currentStep <= 1 || this.submitted) return;
    this.currentStep--;
    this.error = false;
    this.focusStage();
  }

  private focusStage(): void {
    this.changeDetector.detectChanges();
    this.element.nativeElement
      .querySelector<HTMLElement>(this.submitted ? 'h3' : `[data-stage="${this.currentStep}"] h3`)
      ?.focus();
  }
}
