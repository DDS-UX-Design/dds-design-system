import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EXAMPLE_NAVIGATION } from '../example-navigation';
import { SidebarNavComponent } from '../../components/sidebar-nav/sidebar-nav.component';
import { TopBarNavComponent } from '../../components/top-bar-nav/top-bar-nav.component';
import { PageToolbarComponent } from '../../components/page-toolbar/page-toolbar.component';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableRow,
} from '../../components/data-table/data-table.component';
import { ButtonComponent } from '../../components/button/button.component';
import { SearchComponent } from '../../components/search/search.component';
import { SelectComponent } from '../../components/select/select.component';
import { AlertComponent } from '../../components/alert/alert.component';
import { StatusBadgeTone } from '../../components/status-badge/status-badge.component';

type Order = DataTableRow & {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: string;
  tone: StatusBadgeTone;
};

/** Sales order overview composed from DDS navigation, filters, and table components. */
@Component({
  selector: 'dds-orders-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    CommonModule,
    KpiCardComponent,
    SidebarNavComponent,
    TopBarNavComponent,
    PageToolbarComponent,
    DataTableComponent,
    ButtonComponent,
    SearchComponent,
    SelectComponent,
    AlertComponent,
  ],
  templateUrl: './orders-page.component.html',
  styleUrls: [
    '../customer-management-page/customer-management-page.component.css',
    './orders-page.component.css',
  ],
})
export class OrdersPageComponent {
  readonly navigationItems = EXAMPLE_NAVIGATION;
  expandedIds = ['sales'];
  mobileNavigationOpen = false;
  query = '';
  status = 'all';
  currentPage = 1;
  readonly pageSize = 5;
  selectedKeys: Array<string | number> = [];
  detail: Order | null = null;
  notice = '';
  readonly statusOptions = [
    { label: 'All statuses', value: 'all' },
    ...['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((label) => ({
      label,
      value: label.toLowerCase(),
    })),
  ];
  readonly orders: Order[] = [
    {
      id: 'ORD-2084',
      customer: 'Acacia Market',
      date: '8 Oct 2026',
      amount: 42800,
      status: 'Processing',
      tone: 'info',
    },
    {
      id: 'ORD-2083',
      customer: 'Lakeview Supplies',
      date: '8 Oct 2026',
      amount: 18600,
      status: 'Pending',
      tone: 'warning',
    },
    {
      id: 'ORD-2082',
      customer: 'Coastline Traders',
      date: '7 Oct 2026',
      amount: 65400,
      status: 'Shipped',
      tone: 'info',
    },
    {
      id: 'ORD-2081',
      customer: 'Rift Valley Foods',
      date: '7 Oct 2026',
      amount: 31200,
      status: 'Delivered',
      tone: 'success',
    },
    {
      id: 'ORD-2080',
      customer: 'Savanna Retail',
      date: '6 Oct 2026',
      amount: 9500,
      status: 'Cancelled',
      tone: 'neutral',
    },
    {
      id: 'ORD-2079',
      customer: 'Greenline Stores',
      date: '6 Oct 2026',
      amount: 27400,
      status: 'Delivered',
      tone: 'success',
    },
    {
      id: 'ORD-2078',
      customer: 'Highland Goods',
      date: '5 Oct 2026',
      amount: 15800,
      status: 'Pending',
      tone: 'warning',
    },
    {
      id: 'ORD-2077',
      customer: 'Metro Wholesale',
      date: '5 Oct 2026',
      amount: 88000,
      status: 'Processing',
      tone: 'info',
    },
  ];
  readonly columns: DataTableColumn[] = [
    { key: 'id', label: 'Order ID' },
    { key: 'customer', label: 'Customer', width: '25%' },
    { key: 'date', label: 'Order date' },
    {
      key: 'amount',
      label: 'Total',
      align: 'end',
      value: (row) => this.currency(Number(row['amount'])),
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      statusTone: (row) => row['tone'] as StatusBadgeTone,
    },
  ];
  currency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  get filteredOrders(): Order[] {
    const query = this.query.trim().toLowerCase();
    return this.orders.filter(
      (order) =>
        (this.status === 'all' || order.status.toLowerCase() === this.status) &&
        (!query || `${order.id} ${order.customer}`.toLowerCase().includes(query)),
    );
  }
  get visibleOrders(): Order[] {
    return this.filteredOrders.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize,
    );
  }
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOrders.length / this.pageSize));
  }
  get totalValue(): number {
    return this.orders
      .filter((order) => order.status !== 'Cancelled')
      .reduce((sum, order) => sum + order.amount, 0);
  }
  get openOrders(): number {
    return this.orders.filter((order) => ['Pending', 'Processing'].includes(order.status)).length;
  }
  updateQuery(value: string): void {
    this.query = value;
    this.resetPage();
  }
  updateStatus(value: string): void {
    this.status = value;
    this.resetPage();
  }
  clearFilters(): void {
    this.query = '';
    this.status = 'all';
    this.resetPage();
  }
  changePage(value: number): void {
    this.currentPage = Math.max(1, Math.min(this.totalPages, value));
    this.selectedKeys = [];
  }
  showDetails(row: DataTableRow): void {
    this.detail = row as Order;
  }
  refresh(): void {
    this.selectedKeys = [];
    this.notice = 'Orders are up to date.';
  }
  navigate(id: string): void {
    this.mobileNavigationOpen = false;
    if (id === 'orders') return;
    this.notice =
      id === 'customers'
        ? 'Explore Customer Management under Examples in Storybook.'
        : 'This prototype demonstrates Orders. Other sections are available as separate examples.';
  }
  private resetPage(): void {
    this.currentPage = 1;
    this.selectedKeys = [];
  }
}
