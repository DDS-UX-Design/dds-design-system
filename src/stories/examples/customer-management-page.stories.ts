import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CustomerManagementPageComponent } from '../../app/examples/customer-management-page/customer-management-page.component';

const meta: Meta<CustomerManagementPageComponent> = {
  title: 'Pages/Customer Management',
  component: CustomerManagementPageComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An interactive DDS prototype with simulated loading and request failures, retry, combined search and status filters, selection, pagination, customer details, and local customer creation. Success and info Toasts auto-dismiss after five seconds; error Toasts remain until dismissed; Retry remains available beside an unavailable list. Refresh preserves filters. Use Fail next refresh to explore recovery. Data is local to each mounted story. Below 1100px navigation expands inline and the toolbar stacks; the table scrolls horizontally. These responsive choices are prototype proposals pending Figma review.',
      },
    },
  },
  args: { initialState: 'ready', requestDelay: 700, initialQuery: '', initialStatus: 'all' },
  argTypes: {
    initialState: { control: 'select', options: ['ready', 'loading', 'error', 'empty'] },
    requestDelay: { control: { type: 'number', min: 0, max: 5000, step: 100 } },
    initialStatus: {
      control: 'select',
      options: ['all', 'active', 'pending', 'suspended', 'inactive'],
    },
  },
};
export default meta;
type Story = StoryObj<CustomerManagementPageComponent>;

export const Default: Story = { globals: { viewport: { value: 'desktop', isRotated: false } } };
export const Loading: Story = {
  args: { initialState: 'loading', requestDelay: 1500 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading customers');
    await waitFor(() => expect(canvas.getByText('Acacia Market')).toBeVisible(), { timeout: 5000 });
  },
};
export const ErrorAndRetry: Story = {
  args: { initialState: 'error' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Customers could not be loaded');
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss notification' }));
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading customers');
    await waitFor(() => expect(canvas.getByText('Acacia Market')).toBeVisible(), { timeout: 5000 });
  },
};
export const RefreshFailureAndRecovery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Fail next refresh' }));
    const refresh = canvas
      .getAllByRole('button', { name: /Refresh/ })
      .find((button) => button.getBoundingClientRect().width > 0)!;
    await userEvent.click(refresh);
    await waitFor(() => expect(canvas.getByText(/Customers could not be loaded/)).toBeVisible(), {
      timeout: 5000,
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(canvas.getByText('Acacia Market')).toBeVisible(), { timeout: 5000 });
  },
};

export const Filtering: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const query = canvas
      .getAllByRole('combobox')
      .find((input) => input.tagName === 'INPUT' && input.getBoundingClientRect().width > 0)!;
    const status = canvas
      .getAllByRole('combobox')
      .find((input) => input.tagName === 'SELECT' && input.getBoundingClientRect().width > 0)!;
    await userEvent.type(query, 'Nairobi');
    await userEvent.selectOptions(status, 'active');
    await expect(canvas.getByText('Acacia Market')).toBeVisible();
    await expect(canvas.getByText('Metro Wholesale')).toBeVisible();
    await expect(canvas.queryByText('Lakeview Supplies')).not.toBeInTheDocument();
    await userEvent.clear(query);
    await userEvent.type(query, 'No such customer');
    await expect(canvas.getByText(/No customers match your filters/)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }));
    await expect(canvas.getByText('Lakeview Supplies')).toBeVisible();
  },
};
export const PaginationAndDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows' }));
    await expect(canvas.getByText('5 selected')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.queryByText('5 selected')).not.toBeInTheDocument();
    await expect(canvas.getByText('Greenline Stores')).toBeVisible();
    await userEvent.click(canvas.getAllByRole('button', { name: 'View customer' })[0]);
    await expect(canvas.getByRole('heading', { name: 'Greenline Stores' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Close details' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }));
    await expect(canvas.getByText('Acacia Market')).toBeVisible();
  },
};
export const EmptyAndCreate: Story = {
  args: { initialState: 'empty' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/No customers yet/)).toBeVisible();
    const create = canvas
      .getAllByRole('button', { name: 'New customer' })
      .find((button) => button.getBoundingClientRect().width > 0)!;
    await userEvent.click(create);
    await userEvent.click(canvas.getByRole('button', { name: 'Save customer' }));
    await expect(canvas.getByText('Enter a customer name.')).toBeVisible();
    await userEvent.type(canvas.getByRole('textbox', { name: /Customer name/ }), 'Sunrise Stores');
    await userEvent.type(canvas.getByRole('textbox', { name: /Location/ }), 'Nairobi, KE');
    await userEvent.click(canvas.getByRole('button', { name: 'Save customer' }));
    await expect(canvas.getByText('Sunrise Stores')).toBeVisible();
    await expect(canvas.getByText('Sunrise Stores added successfully.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss notification' }));
    await expect(canvas.queryByText('Sunrise Stores added successfully.')).not.toBeInTheDocument();
  },
};
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }));
    await expect(canvas.getByText('DDS Enterprise')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Close navigation' }));
    await expect(canvas.getByText('DDS Enterprise')).not.toBeVisible();
    await expect(canvas.getByRole('combobox', { name: 'Search customers' })).toBeVisible();
  },
};
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
};
export const NoMatches: Story = { args: { initialQuery: 'Unknown customer' } };
