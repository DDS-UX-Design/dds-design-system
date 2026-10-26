import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NumberedPaginationComponent } from '../app/components/numbered-pagination/numbered-pagination.component';

type NumberedPaginationStoryArgs = {
  currentPage: number;
  totalPages: number;
  ariaLabel: string;
  pageChange: ReturnType<typeof fn>;
};

const meta: Meta<NumberedPaginationStoryArgs> = {
  title: 'Building Blocks/Navigation/Pagination/Numbered',
  component: NumberedPaginationComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Numbered pagination supports direct navigation when users benefit from seeing available pages or jumping to a specific result set. It shows every page for small sets and introduces ellipses for larger sets. Keep currentPage between 1 and totalPages and update it in response to pageChange.',
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
    totalPages: 30,
    ariaLabel: 'Search results pagination',
    pageChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-numbered-pagination
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        [ariaLabel]="ariaLabel"
        (pageChange)="currentPage = $event; pageChange($event)"
      ></dds-numbered-pagination>
    `,
  }),
};

export default meta;
type Story = StoryObj<NumberedPaginationStoryArgs>;

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
    totalPages: 30,
  },
};

export const InnerPage: Story = {
  name: 'Inner page',
  args: {
    currentPage: 15,
    totalPages: 30,
  },
};

export const LastPage: Story = {
  name: 'Last page',
  args: {
    currentPage: 30,
    totalPages: 30,
  },
};

export const FewPages: Story = {
  name: 'Few pages',
  args: {
    currentPage: 3,
    totalPages: 5,
  },
};

export const PageSelection: Story = {
  name: 'Page selection',
  args: {
    currentPage: 1,
    totalPages: 5,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }));
    await expect(args.pageChange).toHaveBeenCalledWith(3);
    await expect(canvas.getByRole('button', { name: 'Page 3' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
