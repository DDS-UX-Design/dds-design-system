import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { OrdersPageComponent } from '../../app/examples/orders-page/orders-page.component';

const meta: Meta<OrdersPageComponent> = {
  title: 'Pages/Orders',
  component: OrdersPageComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A Sales / Orders layout using DDS sidebar navigation, page toolbar, status badges, selection, and pagination. Search by order ID or customer, filter by status, and open order details. Summary cards show all orders independently of filters; cancelled orders are excluded from order value. Uses local sample data and the responsive shell from Customer Management. Sales is a new top-level navigation group; Orders now belongs to Sales rather than Logistics.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<OrdersPageComponent>;
export const Default: Story = { globals: { viewport: { value: 'desktop', isRotated: false } } };
export const FilterAndView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const query = canvas
      .getAllByRole('combobox')
      .find((element) => element.tagName === 'INPUT' && element.getBoundingClientRect().width > 0)!;
    await userEvent.type(query, 'Acacia');
    await expect(canvas.getByText('ORD-2084')).toBeVisible();
    await expect(canvas.queryByText('ORD-2083')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'View order' }));
    await expect(canvas.getByRole('heading', { name: 'Order ORD-2084' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Close details' }));
    await userEvent.clear(query);
    await userEvent.type(query, 'Unknown order');
    await expect(canvas.getByText(/No orders match/)).toBeVisible();
    await userEvent.click(
      canvas
        .getAllByRole('button', { name: 'Clear filters' })
        .find((element) => element.getBoundingClientRect().width > 0)!,
    );
    await expect(canvas.getByText('ORD-2083')).toBeVisible();
  },
};
export const Mobile: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } };
export const Tablet: Story = { globals: { viewport: { value: 'tablet', isRotated: false } } };
