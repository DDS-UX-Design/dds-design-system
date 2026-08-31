import { Component } from '@angular/core';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableRow,
} from '../../components/data-table/data-table.component';
import { PageToolbarComponent } from '../../components/page-toolbar/page-toolbar.component';
import { SelectOption } from '../../components/select/select.component';
import {
  SidebarNavComponent,
  SidebarNavItem,
} from '../../components/sidebar-nav/sidebar-nav.component';
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
  standalone: true,
  imports: [DataTableComponent, PageToolbarComponent, SidebarNavComponent, TopBarNavComponent],
  templateUrl: './customer-management-page.component.html',
  styleUrl: './customer-management-page.component.css',
})
export class CustomerManagementPageComponent {
  readonly navigationItems: SidebarNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: 'package',
      children: [
        { id: 'products', label: 'Products' },
        { id: 'stock-levels', label: 'Stock levels' },
      ],
    },
    {
      id: 'logistics',
      label: 'Logistics',
      icon: 'truck',
      children: [
        { id: 'customers', label: 'Customers' },
        { id: 'orders', label: 'Orders' },
        { id: 'shipments', label: 'Shipments' },
      ],
    },
    { id: 'reports', label: 'Reports', icon: 'chart-no-axes-combined' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

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

  readonly customers: CustomerRow[] = [
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
  expandedIds = ['logistics'];
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
  }

  updateStatus(value: string): void {
    this.statusFilter = value;
    this.currentPage = 1;
  }

  refreshTable(): void {
    this.searchValue = '';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.selectedKeys = [];
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
