import { Component, Input } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

export type LoadingOverlayTheme = 'light' | 'dark';
export type LoadingOverlayPlatform = 'web' | 'mobile';

@Component({
  selector: 'dds-loading-overlay',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.css',
})
export class LoadingOverlayComponent {
  @Input() theme: LoadingOverlayTheme = 'light';
  @Input() platform: LoadingOverlayPlatform = 'web';
  @Input() label = 'Loading';
}
