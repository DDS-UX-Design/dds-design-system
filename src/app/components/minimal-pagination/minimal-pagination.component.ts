import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'dds-minimal-pagination',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './minimal-pagination.component.html',
  styleUrl: './minimal-pagination.component.css',
})
export class MinimalPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() ariaLabel = 'Pagination';

  @Output() pageChange = new EventEmitter<number>();

  get normalizedTotalPages(): number {
    return Math.max(1, Math.floor(this.totalPages));
  }

  get normalizedCurrentPage(): number {
    return Math.min(Math.max(1, Math.floor(this.currentPage)), this.normalizedTotalPages);
  }

  get isFirstPage(): boolean {
    return this.normalizedCurrentPage === 1;
  }

  get isLastPage(): boolean {
    return this.normalizedCurrentPage === this.normalizedTotalPages;
  }

  previous(): void {
    if (!this.isFirstPage) {
      this.pageChange.emit(this.normalizedCurrentPage - 1);
    }
  }

  next(): void {
    if (!this.isLastPage) {
      this.pageChange.emit(this.normalizedCurrentPage + 1);
    }
  }
}
