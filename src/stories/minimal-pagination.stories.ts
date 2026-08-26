import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MinimalPaginationComponent } from '../app/components/minimal-pagination/minimal-pagination.component';

type MinimalPaginationStoryArgs = {
  currentPage: number;
  totalPages: number;
  ariaLabel: string;
  pageChange: ReturnType<typeof fn>;
};

const meta: Meta<MinimalPaginationStoryArgs> = {
  title: 'Components/Navigation/Pagination/Minimal',
  component: MinimalPaginationComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Minimal pagination uses the DDS Secondary Button for sequential Previous and Next navigation. Use it when direct page selection is unnecessary or available space is limited. The status text announces page changes to assistive technology.',
      },
    },
  },
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1, step: 1 },
      description: 'Current one-based page number.',
      table: { category: 'State', defaultValue: { summary: '1' } },
    },
    totalPages: {
      control: { type: 'number', min: 1, step: 1 },
      description: 'Total number of available pages.',
      table: { category: 'Content', defaultValue: { summary: '1' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name for the pagination navigation landmark.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Pagination' } },
    },
    pageChange: {
      table: { disable: true },
    },
  },
  args: {
    currentPage: 1,
    totalPages: 12,
    ariaLabel: 'Search results pagination',
    pageChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-minimal-pagination
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        [ariaLabel]="ariaLabel"
        (pageChange)="currentPage = $event; pageChange($event)"
      ></dds-minimal-pagination>
    `,
  }),
};

export default meta;
type Story = StoryObj<MinimalPaginationStoryArgs>;

export const Playground: Story = {};

export const SinglePage: Story = {
  name: 'Single page',
  args: {
    currentPage: 1,
    totalPages: 1,
  },
};

export const FirstPage: Story = {
  name: 'First page',
  args: {
    currentPage: 1,
    totalPages: 12,
  },
};

export const InnerPage: Story = {
  name: 'Inner page',
  args: {
    currentPage: 2,
    totalPages: 12,
  },
};

export const LastPage: Story = {
  name: 'Last page',
  args: {
    currentPage: 12,
    totalPages: 12,
  },
};

export const NextPage: Story = {
  name: 'Next page interaction',
  args: {
    currentPage: 1,
    totalPages: 12,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /Next/ }));
    await expect(args.pageChange).toHaveBeenCalledWith(2);
    await expect(canvas.getByText('Page 2 of 12')).toBeVisible();
  },
};
