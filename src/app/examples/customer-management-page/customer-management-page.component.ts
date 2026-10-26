import { EXAMPLE_NAVIGATION } from '../example-navigation';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { ToastComponent, ToastTone } from '../../components/toast/toast.component';
import { ButtonComponent } from '../../components/button/button.component';
import { TextInputComponent } from '../../components/text-input/text-input.component';
import { SearchComponent } from '../../components/search/search.component';
import { SelectComponent } from '../../components/select/select.component';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableRow,
} from '../../components/data-table/data-table.component';
import { PageToolbarComponent } from '../../components/page-toolbar/page-toolbar.component';
import { SelectOption } from '../../components/select/select.component';
import { SidebarNavComponent } from '../../components/sidebar-nav/sidebar-nav.component';
import { StatusBadgeTone } from '../../components/status-badge/status-badge.component';
import { TopBarNavComponent } from '../../components/top-bar-nav/top-bar-nav.component';

type CustomerRow = DataTableRow & {
  id: number;
  name: string;
  customerId: string;
  location: string;
  lastOrder: string;
  status: string;
  tone: StatusBadgeTone;
};

/** A composed dashboard example showing DDS navigation, form controls, and data display together. */
@Component({
  selector: 'dds-customer-management-page',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    CommonModule,
    ToastComponent,
    ButtonComponent,
    TextInputComponent,
    SearchComponent,
    SelectComponent,
    DataTableComponent,
    PageToolbarComponent,
    SidebarNavComponent,
    TopBarNavComponent,
  ],
  templateUrl: './customer-management-page.component.html',
  styleUrl: './customer-management-page.component.css',
})
export class CustomerManagementPageComponent implements OnInit, OnDestroy {
  /** Simulated first-request outcome for repeatable prototype scenarios. */
  @Input() initialState: 'ready' | 'loading' | 'error' | 'empty' = 'ready';
  @Input() requestDelay = 700;
  @Input() initialQuery = '';
  @Input() initialStatus = 'all';
  loading = false;
  error = false;
  failNextRequest = false;
  notice = '';
  noticeTone: ToastTone = 'success';
  errorNotificationDismissed = false;
  mobileNavigationOpen = false;
  creating = false;
  draftName = '';
  draftLocation = '';
  submitted = false;
  detail: CustomerRow | null = null;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private requestTimer?: ReturnType<typeof setTimeout>;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnInit(): void {
    this.searchValue = this.initialQuery;
    this.statusFilter = this.initialStatus;
    if (this.initialState === 'empty') this.customers = [];
    if (this.initialState === 'error') this.error = true;
    if (this.initialState === 'loading') this.refreshTable();
  }

  ngOnDestroy(): void {
    clearTimeout(this.requestTimer);
  }

  clearFilters(): void {
    this.updateSearch('');
    this.updateStatus('all');
  }

  changePage(page: number): void {
    this.currentPage = Math.min(this.totalPages, Math.max(1, page));
    this.selectedKeys = [];
  }

  openCreate(): void {
    this.creating = true;
    this.detail = null;
    this.draftName = '';
    this.draftLocation = '';
    this.submitted = false;
  }

  saveCustomer(event: Event): void {
    event.preventDefault();
    this.submitted = true;
    if (!this.draftName.trim() || !this.draftLocation.trim()) {
      const fields = this.element.nativeElement.querySelectorAll<HTMLInputElement>('form input');
      fields[this.draftName.trim() ? 1 : 0]?.focus();
      return;
    }
    const id = Math.max(0, ...this.customers.map((customer) => customer.id)) + 1;
    this.customers = [
      this.customer(
        id,
        this.draftName.trim(),
        `CUS-${1048 + id}`,
        this.draftLocation.trim(),
        'No orders yet',
        'Active',
        'success',
      ),
      ...this.customers,
    ];
    this.creating = false;
    this.clearFilters();
    this.noticeTone = 'success';
    this.notice = `${this.draftName.trim()} added successfully.`;
  }

  showDetails(row: DataTableRow): void {
    this.detail = row as CustomerRow;
    this.creating = false;
  }

  navigate(id: string): void {
    this.activeItemId = 'customers';
    this.mobileNavigationOpen = false;
    this.noticeTone = 'info';
    if (id === 'orders') {
      this.notice = 'Explore the Orders layout under Pages / Orders in Storybook.';
      return;
    }
    if (id !== 'customers')
      this.notice = 'This prototype demonstrates Customers. Other sections are not available yet.';
  }

  readonly navigationItems = EXAMPLE_NAVIGATION;

  readonly statusOptions: SelectOption[] = [
    { label: 'All statuses', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Inactive', value: 'inactive' },
  ];

  readonly columns: DataTableColumn[] = [
    { key: 'name', label: 'Customer', width: '22%' },
    { key: 'customerId', label: 'Customer ID', width: '16%' },
    { key: 'location', label: 'Location', width: '20%' },
    { key: 'lastOrder', label: 'Last order', width: '18%' },
    {
      key: 'status',
      label: 'Status',
      width: '16%',
      type: 'status',
      statusTone: (row) => row['tone'] as StatusBadgeTone,
    },
  ];

  customers: CustomerRow[] = [
    this.customer(
      1,
      'Acacia Market',
      'CUS-1048',
      'Nairobi, KE',
      '30 Aug 2026',
      'Active',
      'success',
    ),
    this.customer(
      2,
      'Lakeview Supplies',
      'CUS-1047',
      'Kisumu, KE',
      '29 Aug 2026',
      'Active',
      'success',
    ),
    this.customer(
      3,
      'Coastline Traders',
      'CUS-1046',
      'Mombasa, KE',
      '28 Aug 2026',
      'Pending',
      'warning',
    ),
    this.customer(
      4,
      'Rift Valley Foods',
      'CUS-1045',
      'Nakuru, KE',
      '27 Aug 2026',
      'Suspended',
      'danger',
    ),
    this.customer(
      5,
      'Savanna Retail',
      'CUS-1044',
      'Eldoret, KE',
      '25 Aug 2026',
      'Inactive',
      'neutral',
    ),
    this.customer(
      6,
      'Greenline Stores',
      'CUS-1043',
      'Thika, KE',
      '24 Aug 2026',
      'Active',
      'success',
    ),
    this.customer(
      7,
      'Highland Goods',
      'CUS-1042',
      'Nyeri, KE',
      '22 Aug 2026',
      'Pending',
      'warning',
    ),
    this.customer(
      8,
      'Metro Wholesale',
      'CUS-1041',
      'Nairobi, KE',
      '21 Aug 2026',
      'Active',
      'success',
    ),
    this.customer(
      9,
      'Eastern Merchants',
      'CUS-1040',
      'Embu, KE',
      '18 Aug 2026',
      'Inactive',
      'neutral',
    ),
    this.customer(
      10,
      'Frontier Supply Co.',
      'CUS-1039',
      'Garissa, KE',
      '16 Aug 2026',
      'Active',
      'success',
    ),
    this.customer(
      11,
      'Summit Distributors',
      'CUS-1038',
      'Kericho, KE',
      '14 Aug 2026',
      'Suspended',
      'danger',
    ),
    this.customer(
      12,
      'Harbour Essentials',
      'CUS-1037',
      'Malindi, KE',
      '12 Aug 2026',
      'Active',
      'success',
    ),
  ];

  activeItemId = 'customers';
  expandedIds = ['crm'];
  searchValue = '';
  statusFilter = 'all';
  currentPage = 1;
  readonly pageSize = 5;
  selectedKeys: Array<string | number> = [];

  get filteredCustomers(): CustomerRow[] {
    const query = this.searchValue.trim().toLowerCase();

    return this.customers.filter((customer) => {
      const matchesStatus =
        this.statusFilter === 'all' || customer.status.toLowerCase() === this.statusFilter;
      const matchesQuery =
        !query ||
        [customer.name, customer.customerId, customer.location].some((value) =>
          value.toLowerCase().includes(query),
        );

      return matchesStatus && matchesQuery;
    });
  }

  get visibleCustomers(): CustomerRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCustomers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCustomers.length / this.pageSize));
  }

  updateSearch(value: string): void {
    this.searchValue = value;
    this.currentPage = 1;
    this.selectedKeys = [];
  }

  updateStatus(value: string): void {
    this.statusFilter = value;
    this.currentPage = 1;
    this.selectedKeys = [];
  }

  refreshTable(): void {
    clearTimeout(this.requestTimer);
    this.loading = true;
    this.error = false;
    this.errorNotificationDismissed = false;
    this.selectedKeys = [];
    const fail = this.failNextRequest;
    this.failNextRequest = false;
    this.requestTimer = setTimeout(
      () => {
        this.loading = false;
        this.error = fail;
        this.noticeTone = 'success';
        this.notice = fail ? '' : 'Customer records are up to date.';
        this.changeDetector.markForCheck();
      },
      Math.max(0, this.requestDelay),
    );
  }

  private customer(
    id: number,
    name: string,
    customerId: string,
    location: string,
    lastOrder: string,
    status: string,
    tone: StatusBadgeTone,
  ): CustomerRow {
    return { id, name, customerId, location, lastOrder, status, tone };
  }
}
