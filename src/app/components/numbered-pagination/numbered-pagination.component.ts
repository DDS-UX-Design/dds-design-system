import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

@Component({
  selector: 'dds-numbered-pagination',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './numbered-pagination.component.html',
  styleUrl: './numbered-pagination.component.css',
})
export class NumberedPaginationComponent {
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

  get items(): PaginationItem[] {
    const total = this.normalizedTotalPages;
    const current = this.normalizedCurrentPage;

    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 'ellipsis-end', total];
    }

    if (current >= total - 2) {
      return [1, 'ellipsis-start', total - 3, total - 2, total - 1, total];
    }

    return [1, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total];
  }

  get isFirstPage(): boolean {
    return this.normalizedCurrentPage === 1;
  }

  get isLastPage(): boolean {
    return this.normalizedCurrentPage === this.normalizedTotalPages;
  }

  selectPage(page: number): void {
    const nextPage = Math.min(Math.max(1, page), this.normalizedTotalPages);

    if (nextPage !== this.normalizedCurrentPage) {
      this.pageChange.emit(nextPage);
    }
  }

  asPageNumber(item: PaginationItem): number {
    return item as number;
  }

  trackItem(_index: number, item: PaginationItem): PaginationItem {
    return item;
  }
}
