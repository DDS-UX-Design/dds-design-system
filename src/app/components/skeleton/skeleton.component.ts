import { Component, Input } from '@angular/core';

@Component({
  selector: 'dds-skeleton',
  standalone: true,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent {
  @Input() width: string | number = 230;
  @Input() height: string | number = 16;
  @Input() animated = true;

  get resolvedWidth(): string {
    return typeof this.width === 'number' ? `${this.width}px` : this.width;
  }

  get resolvedHeight(): string {
    return typeof this.height === 'number' ? `${this.height}px` : this.height;
  }
}
