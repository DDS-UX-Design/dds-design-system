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
        `<div style="width: fit-content; height: 790px; max-height: calc(100vh - 32px)">${story}</div>`,
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A persistent application sidebar with a branded header, scrollable navigation with an optional divider-separated bottomItems list, one level of expandable groups, active-page indication, and a version footer. Toggle between the 250px expanded sidebar and 72px icon rail; collapsed groups expand the sidebar to expose child destinations.',
      },
    },
  },
  args: {
    collapsed: false,
    logoSrc: 'images/dds-brand-icon.svg',
    title: 'DDS Enterprise',
    footer: 'Version 1.0.0',
    ariaLabel: 'Primary navigation',
    items: items.slice(0, 3),
    bottomItems: items.slice(3),
    activeItemId: 'all-orders',
    expandedIds: ['orders'],
    onItemSelect: fn(),
  },
  argTypes: {
    collapsed: { control: 'boolean', description: 'Show the 72px icon rail.' },
    bottomItems: { control: 'object', description: 'Secondary destinations below the divider.' },
    onItemSelect: { action: 'itemSelect', table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <!-- Demo links update selection without navigating away from the Storybook preview. -->
      <dds-sidebar-nav
        [title]="title" [logoSrc]="logoSrc" [footer]="footer" [ariaLabel]="ariaLabel" [items]="items" [bottomItems]="bottomItems"
        [(collapsed)]="collapsed" [(activeItemId)]="activeItemId" [(expandedIds)]="expandedIds"
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
      ...items.slice(0, 3),
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
  args: {
    items: EXAMPLE_NAVIGATION.slice(0, 4),
    bottomItems: EXAMPLE_NAVIGATION.slice(4),
    activeItemId: 'orders',
    expandedIds: ['sales'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shared example navigation with Sales as a top-level group and Orders selected.',
      },
    },
  },
};

export const Collapsed: Story = { args: { collapsed: true } };

export const CollapseAndExpand: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
    await expect(canvas.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(canvas.queryByRole('link', { name: 'All orders' })).not.toBeInTheDocument();
    const orders = canvas.getByRole('button', { name: 'Orders' });
    await userEvent.hover(orders);
    await expect(canvas.getByRole('tooltip')).toHaveTextContent('Orders');
    await userEvent.click(orders);
    await expect(canvas.getByRole('button', { name: 'Collapse sidebar' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByRole('link', { name: 'All orders' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

const topItems: SidebarNavItem[] = [
  { id: 'first', label: 'Parent', icon: 'info', href: '#first' },
  {
    id: 'second',
    label: 'Parent',
    icon: 'info',
    children: [{ id: 'second-child', label: 'Child', href: '#second-child' }],
  },
  {
    id: 'active',
    label: 'Parent (Active)',
    icon: 'info',
    children: Array.from({ length: 7 }, (_, index) => ({
      id: `child-${index}`,
      label: index === 0 ? 'Child (Active)' : index === 3 ? 'Child (Hover)' : 'Child',
      href: `#child-${index}`,
    })),
  },
  {
    id: 'hover',
    label: 'Parent (Hover)',
    icon: 'info',
    children: [{ id: 'hover-child', label: 'Child', href: '#hover-child' }],
  },
];
const bottomItems: SidebarNavItem[] = [
  { id: 'bottom-first', label: 'Parent', icon: 'info', href: '#bottom-first' },
  { id: 'bottom-second', label: 'Parent', icon: 'info', href: '#bottom-second' },
];
const renderTheme =
  (theme: string, initialCollapsed = false) =>
  () => ({
    props: {
      topItems,
      bottomItems,
      collapsed: initialCollapsed,
      activeItemId: 'child-0',
      expandedIds: ['active'],
    },
    template: `
<section data-theme="${theme}" style="padding:32px;background:var(--color-bg-default);color:var(--color-text-primary)">
<h2>Sidebar Nav · ${theme}</h2>
<div style="height:790px;width:fit-content;max-width:100%">
<dds-sidebar-nav [items]="topItems" [bottomItems]="bottomItems" [(collapsed)]="collapsed" [(activeItemId)]="activeItemId" [(expandedIds)]="expandedIds" (click)="$event.preventDefault()" />
</div></section>`,
  });

async function role(element: Element, property: string, token: string) {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  element.appendChild(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  await expect(getComputedStyle(element).getPropertyValue(property)).toBe(colour);
}

const verifyExpanded = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const host = canvasElement.querySelector('dds-sidebar-nav')!;
  const aside = host.querySelector('aside')!;
  await expect(host.getBoundingClientRect().width).toBe(250);
  await expect(aside.getBoundingClientRect().height).toBe(790);
  await expect(host.querySelector('header')!.getBoundingClientRect().height).toBe(65);
  await expect(host.querySelector('footer')!.getBoundingClientRect().height).toBe(65);
  await role(aside, 'background-color', '--color-bg-elevated');
  await role(aside, 'color', '--color-text-primary');
  const active = canvas.getByRole('button', { name: 'Parent (Active)' });
  await role(active, 'background-color', '--color-feedback-info-subtle');
  await role(active.querySelector('dds-icon')!, 'color', '--color-icon-default');
  await expect(active.getBoundingClientRect().height).toBe(48);
  await expect(active.querySelector('svg')!.getBoundingClientRect().width).toBe(20);
  const first = host.querySelector('.dds-sidebar-nav__parent')!;
  await expect(first.getBoundingClientRect().top - aside.getBoundingClientRect().top).toBe(85);
  const child = canvas.getByRole('link', { name: 'Child (Active)' });
  await expect(child.getBoundingClientRect().height).toBe(36);
  await expect(child).toHaveAttribute('aria-current', 'page');
  await role(child, 'color', '--color-interactive-default');
  const hover = canvas.getByRole('button', { name: 'Parent (Hover)' });
  await userEvent.hover(hover);
  await role(hover, 'background-color', '--color-feedback-info-subtle');
  const image: HTMLImageElement = host.querySelector('img')!;
  await expect(image.getBoundingClientRect().width).toBe(23);
  await expect(image.getBoundingClientRect().height).toBe(24);
  await expect(image.complete && image.naturalWidth > 0).toBe(true);
  await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
  await expect(host.getBoundingClientRect().width).toBe(72);
  await expect(canvas.queryByRole('link', { name: 'Child (Active)' })).not.toBeInTheDocument();
  await userEvent.hover(canvas.getByRole('button', { name: 'Parent (Active)' }));
  await expect(canvas.getByRole('tooltip')).toHaveTextContent('Parent (Active)');
  await userEvent.keyboard('{Escape}');
  await expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument();
  // Explicit focus/keyboard activation also works without pointer interaction.
  const toggle = canvas.getByRole('button', { name: 'Expand sidebar' });
  toggle.focus();
  await userEvent.keyboard('{Enter}');
  await expect(host.getBoundingClientRect().width).toBe(250);
  await expect(canvas.getByRole('link', { name: 'Child (Active)' })).toHaveAttribute(
    'aria-current',
    'page',
  );
};

export const Light: Story = { render: renderTheme('light'), play: verifyExpanded };
export const Dark: Story = { render: renderTheme('dark'), play: verifyExpanded };
export const CollapsedLight: Story = { render: renderTheme('light', true) };
export const CollapsedDark: Story = { render: renderTheme('dark', true) };
