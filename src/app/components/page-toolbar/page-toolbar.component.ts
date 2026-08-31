import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { DdsIconName } from '../icon/icon.component';
import { SearchComponent } from '../search/search.component';
import { SelectComponent, SelectOption } from '../select/select.component';

/** A page-level action bar combining search, filtering, refresh, and a primary action. */
@Component({
  selector: 'dds-page-toolbar',
  standalone: true,
  imports: [ButtonComponent, SearchComponent, SelectComponent],
  templateUrl: './page-toolbar.component.html',
  styleUrl: './page-toolbar.component.css',
})
export class PageToolbarComponent {
  /** Current search query. */
  @Input() searchValue = '';

  /** Search field placeholder and accessible name. */
  @Input() searchPlaceholder = 'Search...';

  /** Current filter value. */
  @Input() filterValue = '';

  /** Options shown in the filter select. */
  @Input() filterOptions: SelectOption[] = [];

  /** Filter placeholder and accessible name. */
  @Input() filterLabel = 'Select option';

  /** Controls whether the filter field is rendered. */
  @Input() showFilter = true;

  /** Visible label for the primary action. */
  @Input() actionLabel = 'New item';

  /** Leading icon for the primary action. */
  @Input() actionIcon: DdsIconName = 'plus';

  /** Disables toolbar actions while data is refreshing. */
  @Input() refreshing = false;

  /** Disables the primary action independently of refresh state. */
  @Input() actionDisabled = false;

  /** Emitted whenever the search query changes. */
  @Output() searchValueChange = new EventEmitter<string>();

  /** Emitted when the search field is submitted. */
  @Output() searchSubmit = new EventEmitter<string>();

  /** Emitted whenever the selected filter changes. */
  @Output() filterValueChange = new EventEmitter<string>();

  /** Emitted when the refresh action is requested. */
  @Output() refresh = new EventEmitter<void>();

  /** Emitted when the primary action is requested. */
  @Output() action = new EventEmitter<void>();

  updateSearch(value: string): void {
    this.searchValue = value;
    this.searchValueChange.emit(value);
  }

  updateFilter(value: string): void {
    this.filterValue = value;
    this.filterValueChange.emit(value);
  }
}
