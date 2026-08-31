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
  title: 'Components/Data Display/Data Table',
  component: DataTableComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `
        <div style="box-sizing: border-box; width: 993px; max-width: 100%; margin: 0 auto; padding: 24px;">
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
          'A responsive, accessible data table with optional search and filter controls, row selection, bulk actions, loading placeholders, status badges, row actions, and minimal pagination.',
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
    filterOptions: [
      { label: 'All statuses', value: 'all' },
      { label: 'Success', value: 'success' },
      { label: 'Warning', value: 'warning' },
    ],
    rowActions: [{ label: 'More actions', icon: 'ellipsis' }],
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
        [selectable]="selectable" [showToolbar]="showToolbar" [loading]="loading"
        [showPagination]="showPagination" [currentPage]="currentPage"
        [totalPages]="totalPages" [totalItems]="totalItems" [pageSize]="pageSize"
        [filterOptions]="filterOptions" [rowActions]="rowActions" [bulkActions]="bulkActions"
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
export const WithToolbar: Story = { args: { showToolbar: true } };
export const Selectable: Story = { args: { selectable: true, showToolbar: true } };
export const BulkActions: Story = { args: { selectable: true, selectedKeys: [1, 2] } };
export const Loading: Story = { args: { loading: true, showPagination: false } };
export const Empty: Story = { args: { rows: [], totalItems: 0, totalPages: 1 } };

export const RowSelection: Story = {
  args: { selectable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 1' }));
    await expect(canvas.getByText('1 selected')).toBeInTheDocument();
  },
};
