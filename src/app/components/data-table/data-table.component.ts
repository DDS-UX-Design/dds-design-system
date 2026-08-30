import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { CheckboxComponent, CheckboxValue } from '../checkbox/checkbox.component';
import { DdsIconName } from '../icon/icon.component';
import { MinimalPaginationComponent } from '../minimal-pagination/minimal-pagination.component';
import { SearchComponent } from '../search/search.component';
import { SelectComponent, SelectOption } from '../select/select.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../status-badge/status-badge.component';

export type DataTableRow = Record<string, unknown>;

export type DataTableColumn = {
  key: string;
  label: string;
  width?: string;
  align?: 'start' | 'center' | 'end';
  type?: 'text' | 'status';
  statusTone?: StatusBadgeTone | ((row: DataTableRow) => StatusBadgeTone);
  value?: (row: DataTableRow) => string | number | null | undefined;
};

export type DataTableAction = {
  label: string;
  icon?: DdsIconName;
  styleType?: 'default' | 'danger';
};

@Component({
  selector: 'dds-data-table',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CheckboxComponent,
    MinimalPaginationComponent,
    SearchComponent,
    SelectComponent,
    SkeletonComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent {
  @Input() caption = 'Data table';
  @Input() columns: DataTableColumn[] = [];
  @Input() rows: DataTableRow[] = [];
  @Input() rowKey = 'id';
  @Input() selectable = false;
  @Input() loading = false;
  @Input() loadingRows = 5;
  @Input() showToolbar = false;
  @Input() showPagination = true;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() searchValue = '';
  @Input() searchPlaceholder = 'Search...';
  @Input() filterLabel = 'Filter';
  @Input() filterValue = '';
  @Input() filterOptions: SelectOption[] = [];
  @Input() toolbarActionLabel = 'Add new';
  @Input() toolbarActionIcon: DdsIconName = 'plus';
  @Input() rowActions: DataTableAction[] = [{ label: 'More actions', icon: 'ellipsis' }];
  @Input() bulkActions: DataTableAction[] = [];
  @Input() emptyMessage = 'No results found.';
  @Input() selectedKeys: Array<string | number> = [];

  @Output() selectedKeysChange = new EventEmitter<Array<string | number>>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchSubmit = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() toolbarAction = new EventEmitter<void>();
  @Output() rowAction = new EventEmitter<{ action: DataTableAction; row: DataTableRow }>();
  @Output() bulkAction = new EventEmitter<DataTableAction>();

  get visibleColumnCount(): number {
    return this.columns.length + (this.selectable ? 1 : 0) + (this.rowActions.length ? 1 : 0);
  }

  get skeletonRows(): number[] {
    return Array.from({ length: Math.max(1, this.loadingRows) }, (_, index) => index);
  }

  get selectedCount(): number {
    return this.rows.filter((row) => this.isSelected(row)).length;
  }

  get allSelected(): boolean {
    return this.rows.length > 0 && this.selectedCount === this.rows.length;
  }

  get headerCheckboxValue(): CheckboxValue {
    if (this.allSelected) return 'checked';
    return this.selectedCount > 0 ? 'indeterminate' : 'unchecked';
  }

  get displayStart(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get displayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  rowIdentity(row: DataTableRow): string | number {
    const value = row[this.rowKey];
    return typeof value === 'string' || typeof value === 'number' ? value : this.rows.indexOf(row);
  }

  isSelected(row: DataTableRow): boolean {
    return this.selectedKeys.includes(this.rowIdentity(row));
  }

  toggleRow(row: DataTableRow, value: CheckboxValue): void {
    const key = this.rowIdentity(row);
    const next = new Set(this.selectedKeys);
    value === 'checked' ? next.add(key) : next.delete(key);
    this.updateSelection([...next]);
  }

  toggleAll(value: CheckboxValue): void {
    const visibleKeys = this.rows.map((row) => this.rowIdentity(row));
    const next = new Set(this.selectedKeys);
    if (value === 'checked') visibleKeys.forEach((key) => next.add(key));
    else visibleKeys.forEach((key) => next.delete(key));
    this.updateSelection([...next]);
  }

  clearSelection(): void {
    this.updateSelection([]);
  }

  cellValue(column: DataTableColumn, row: DataTableRow): string | number {
    const value = column.value ? column.value(row) : row[column.key];
    return typeof value === 'string' || typeof value === 'number' ? value : '';
  }

  statusTone(column: DataTableColumn, row: DataTableRow): StatusBadgeTone {
    return typeof column.statusTone === 'function'
      ? column.statusTone(row)
      : (column.statusTone ?? 'info');
  }

  trackRow = (_index: number, row: DataTableRow): string | number => this.rowIdentity(row);
  trackColumn = (_index: number, column: DataTableColumn): string => column.key;

  private updateSelection(keys: Array<string | number>): void {
    this.selectedKeys = keys;
    this.selectedKeysChange.emit(keys);
  }
}
