import { EXAMPLE_NAVIGATION } from '../app/examples/example-navigation';
import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  SidebarNavComponent,
  SidebarNavItem,
} from '../app/components/sidebar-nav/sidebar-nav.component';

type SidebarNavStoryArgs = SidebarNavComponent & {
  onItemSelect: ReturnType<typeof fn>;
};

const items: SidebarNavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'layout-dashboard', href: '#overview' },
  {
    id: 'orders',
    label: 'Orders',
    icon: 'shopping-cart',
    children: [
      { id: 'all-orders', label: 'All orders', href: '#all-orders' },
      { id: 'pending-orders', label: 'Pending orders', href: '#pending-orders' },
      { id: 'returns', label: 'Returns', href: '#returns' },
      { id: 'drafts', label: 'Draft orders', href: '#drafts' },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: 'users',
    children: [
      { id: 'customer-list', label: 'Customer list', href: '#customer-list' },
      { id: 'segments', label: 'Segments', href: '#segments' },
    ],
  },
  { id: 'reports', label: 'Reports', icon: 'chart-no-axes-column', href: '#reports' },
  { id: 'settings', label: 'Settings', icon: 'settings', href: '#settings' },
];

const meta: Meta<SidebarNavStoryArgs> = {
  title: 'Components/Navigation/Sidebar Nav',
  component: SidebarNavComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) =>
        `<div style="width: 250px; height: 790px; max-height: calc(100vh - 32px)">${story}</div>`,
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A persistent application sidebar with a branded header, scrollable navigation, one level of expandable groups, active-page indication, and a version footer.',
      },
    },
  },
  args: {
    title: 'DDS Enterprise',
    footer: 'Version 1.0.0',
    ariaLabel: 'Primary navigation',
    items,
    activeItemId: 'all-orders',
    expandedIds: ['orders'],
    onItemSelect: fn(),
  },
  argTypes: {
    onItemSelect: { action: 'itemSelect', table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <!-- Demo links update selection without navigating away from the Storybook preview. -->
      <dds-sidebar-nav
        [title]="title" [footer]="footer" [ariaLabel]="ariaLabel" [items]="items"
        [(activeItemId)]="activeItemId" [(expandedIds)]="expandedIds"
        (itemSelect)="onItemSelect($event)"
        (click)="$event.preventDefault()"
      ></dds-sidebar-nav>
    `,
  }),
};

export default meta;
type Story = StoryObj<SidebarNavStoryArgs>;

export const Default: Story = {};
export const AllCollapsed: Story = { args: { activeItemId: 'overview', expandedIds: [] } };
export const MultipleGroupsOpen: Story = { args: { expandedIds: ['orders', 'customers'] } };
export const LongContent: Story = {
  args: {
    title: 'DDS Enterprise Platform',
    footer: 'Development · Version 1.0.0-beta.12',
    items: [
      ...items,
      ...Array.from({ length: 8 }, (_, index) => ({
        id: `extra-${index}`,
        label: `Additional navigation item ${index + 1}`,
        icon: 'info' as const,
        href: `#extra-${index}`,
      })),
    ],
  },
};

export const ExpandAndSelect: Story = {
  args: { activeItemId: 'overview', expandedIds: [] },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const orders = canvas.getByRole('button', { name: 'Orders' });
    await userEvent.click(orders);
    await expect(orders).toHaveAttribute('aria-expanded', 'true');

    const pendingOrders = canvas.getByRole('link', { name: 'Pending orders' });
    await userEvent.click(pendingOrders);
    await expect(pendingOrders).toHaveAttribute('aria-current', 'page');
    await expect(args.onItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'pending-orders' }),
    );
  },
};

export const SalesNavigation: Story = {
  args: { items: EXAMPLE_NAVIGATION, activeItemId: 'orders', expandedIds: ['sales'] },
  parameters: {
    docs: {
      description: {
        story: 'Shared example navigation with Sales as a top-level group and Orders selected.',
      },
    },
  },
};
