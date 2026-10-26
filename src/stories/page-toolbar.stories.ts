import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { PageToolbarComponent } from '../app/components/page-toolbar/page-toolbar.component';

const meta: Meta<PageToolbarComponent> = {
  title: 'Compositions/Navigation/Page Toolbar',
  component: PageToolbarComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A responsive page-level toolbar for finding, filtering, refreshing, and creating items. Labels and options are configurable so the actions stay specific to their workflow.',
      },
    },
  },
  args: {
    searchPlaceholder: 'Search...',
    filterLabel: 'Select option',
    filterValue: '',
    filterOptions: [
      { label: 'Option', value: 'option' },
      { label: 'Second option', value: 'second' },
    ],
    actionLabel: 'New',
    searchValueChange: fn(),
    searchSubmit: fn(),
    filterValueChange: fn(),
    refresh: fn(),
    action: fn(),
  },
};

export default meta;
type Story = StoryObj<PageToolbarComponent>;

export const Default: Story = {};

export const SearchQueryAndFilter: Story = {
  args: {
    searchValue: 'Search term',
    filterValue: 'option',
  },
};

export const Refreshing: Story = {
  args: {
    searchValue: 'Search term',
    filterValue: 'option',
    refreshing: true,
  },
};

export const SearchOnly: Story = {
  args: {
    showFilter: false,
  },
};
