import { Component, Input } from '@angular/core';

export type SpinnerSize = 'mobile' | 'desktop';

@Component({
  selector: 'dds-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'mobile';
  @Input() label = 'Loading';
  @Input() animated = true;
}
