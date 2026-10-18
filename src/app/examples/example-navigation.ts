import { SidebarNavItem } from '../components/sidebar-nav/sidebar-nav.component';

export const EXAMPLE_NAVIGATION: SidebarNavItem[] = [
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
    id: 'crm',
    label: 'CRM',
    icon: 'users',
    children: [{ id: 'customers', label: 'Customers' }],
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: 'shopping-cart',
    children: [{ id: 'orders', label: 'Orders' }],
  },
  { id: 'reports', label: 'Reports', icon: 'chart-no-axes-combined' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];
