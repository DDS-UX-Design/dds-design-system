import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableRow,
} from '../app/components/data-table/data-table.component';

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Name', width: '180px' },
  { key: 'reference', label: 'Reference' },
  { key: 'owner', label: 'Owner' },
  { key: 'date', label: 'Date' },
  {
    key: 'status',
    label: 'Status',
    width: '132px',
    type: 'status',
    statusTone: (row) => row['tone'] as 'info' | 'success' | 'warning' | 'danger',
  },
];

const rows: DataTableRow[] = [
  {
    id: 1,
    name: 'Northwind order',
    reference: 'DDS-1024',
    owner: 'Amina Noor',
    date: '24 Aug 2026',
    status: 'Informative',
    tone: 'info',
  },
  {
    id: 2,
    name: 'Contoso renewal',
    reference: 'DDS-1025',
    owner: 'Brian Otieno',
    date: '25 Aug 2026',
    status: 'Success',
    tone: 'success',
  },
  {
    id: 3,
    name: 'Fabrikam review',
    reference: 'DDS-1026',
    owner: 'Chao Wei',
    date: '26 Aug 2026',
    status: 'Warning',
    tone: 'warning',
  },
  {
    id: 4,
    name: 'Adventure Works',
    reference: 'DDS-1027',
    owner: 'Diana Kim',
    date: '27 Aug 2026',
    status: 'Danger',
    tone: 'danger',
  },
  {
    id: 5,
    name: 'Tailspin request',
    reference: 'DDS-1028',
    owner: 'Elena Rossi',
    date: '28 Aug 2026',
    status: 'Success',
    tone: 'success',
  },
];

type DataTableStoryArgs = DataTableComponent & {
  onRowAction: ReturnType<typeof fn>;
  onBulkAction: ReturnType<typeof fn>;
};

const meta: Meta<DataTableStoryArgs> = {
  title: 'Compositions/Data Display/Data Table',
  component: DataTableComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `
        <div style="width: 945px; max-width: calc(100% - 48px); margin: 24px auto;">
          ${story}
        </div>
      `,
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A data table with selection, bulk actions, status badges and pagination. Use rowActions for direct actions and rowActionMenu for a short overflow menu; both emit the original action and row through rowAction. Menu icons are omitted, matching the label-only menu design. Confirm irreversible actions in the application and explain disabled actions nearby. Use Page Toolbar for page-level search and filtering.',
      },
    },
  },
  args: {
    caption: 'Orders',
    columns,
    rows,
    totalItems: 20,
    totalPages: 2,
    currentPage: 1,
    pageSize: 10,
    selectedKeys: [],
    rowActions: [],
    rowActionMenu: [
      { label: 'View order' },
      { label: 'Duplicate' },
      { label: 'Export', disabled: true },
      { label: 'Delete', styleType: 'danger' },
    ],
    bulkActions: [
      { label: 'Archive', icon: 'archive' },
      { label: 'Delete', icon: 'trash-2', styleType: 'danger' },
    ],
    onRowAction: fn(),
    onBulkAction: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-data-table
        [caption]="caption" [columns]="columns" [rows]="rows"
        [selectable]="selectable" [loading]="loading"
        [showPagination]="showPagination" [currentPage]="currentPage"
        [totalPages]="totalPages" [totalItems]="totalItems" [pageSize]="pageSize"
        [rowActions]="rowActions" [rowActionMenu]="rowActionMenu" [bulkActions]="bulkActions"
        [(selectedKeys)]="selectedKeys"
        (pageChange)="currentPage = $event"
        (rowAction)="onRowAction($event)" (bulkAction)="onBulkAction($event)"
      ></dds-data-table>
    `,
  }),
};

export default meta;
type Story = StoryObj<DataTableStoryArgs>;

export const Default: Story = {};
export const Pagination: Story = {
  args: {
    showPagination: true,
    currentPage: 1,
    totalPages: 12,
    totalItems: 20,
    pageSize: 10,
  },
};
export const Selectable: Story = { args: { selectable: true } };
export const BulkActions: Story = { args: { selectable: true, selectedKeys: [1, 2] } };
export const Loading: Story = {
  args: { loading: true, showPagination: false, rowActions: [], rowActionMenu: [] },
};
export const Empty: Story = { args: { rows: [], totalItems: 0, totalPages: 1 } };

export const RowSelection: Story = {
  args: { selectable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 1' }));
    await expect(canvas.getByText('1 selected')).toBeInTheDocument();
  },
};

export const RowActionMenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Export is unavailable until the report is ready. Scroll the table horizontally or use a narrow viewport to review menu clipping and automatic placement.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'More actions for row 1' });
    await userEvent.click(trigger);
    const menu = canvas.getByRole('menu');
    await expect(within(menu).getByRole('menuitem', { name: 'Export' })).toBeDisabled();
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'View order' }));
    await expect(args.onRowAction).toHaveBeenLastCalledWith({
      action: args.rowActionMenu[0],
      row: args.rows[0],
    });
    await expect(trigger).toHaveFocus();
  },
};
