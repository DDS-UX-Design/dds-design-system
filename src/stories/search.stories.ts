import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  SearchComponent,
  SearchSize,
  SearchState,
} from '../app/components/search/search.component';

type SearchStoryArgs = {
  label: string;
  value: string;
  placeholder: string;
  size: SearchSize;
  state: SearchState;
  required: boolean;
  showLabel: boolean;
  ariaLabel: string;
  suggestions: string[];
  expanded: boolean;
  loading: boolean;
  onSearch: ReturnType<typeof fn>;
  onSuggestionSelected: ReturnType<typeof fn>;
};

const exampleSuggestions = ['Customer accounts', 'Customer orders', 'Customer support'];

const meta: Meta<SearchStoryArgs> = {
  title: 'Building Blocks/Forms/Search',
  component: SearchComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A search field with optional suggestions. Users can type a query, submit with Enter, or navigate suggestions with the Up and Down arrow keys and select with Enter. Use a concise label that identifies the content being searched.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Visible label describing the search scope.',
      if: { arg: 'showLabel', eq: true },
      table: { category: 'Content' },
    },
    value: {
      control: 'text',
      description: 'Current search query.',
      table: { category: 'Content' },
    },
    placeholder: {
      control: 'text',
      description: 'Short input hint; it does not replace a label.',
      table: { category: 'Content' },
    },
    size: {
      control: 'radio',
      options: ['large', 'small'],
      description: 'Large or Small field treatment from the design specification.',
      table: { category: 'Appearance', defaultValue: { summary: 'large' } },
    },
    state: {
      control: 'radio',
      options: ['default', 'focused'],
      description: 'Deterministic visual state for design review.',
      table: { category: 'State', defaultValue: { summary: 'default' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the native search input as required.',
      table: { category: 'Validation', defaultValue: { summary: 'false' } },
    },
    showLabel: {
      control: 'boolean',
      description: 'Shows the visible label. An accessible name remains when hidden.',
      table: { category: 'Content', defaultValue: { summary: 'true' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name used when the visible label is hidden.',
      if: { arg: 'showLabel', eq: false },
      table: { category: 'Accessibility' },
    },
    suggestions: {
      control: 'object',
      description: 'Suggested results presented in the combobox listbox.',
      table: { category: 'Suggestions' },
    },
    expanded: {
      control: 'boolean',
      description: 'Opens the suggestions menu for controlled previews.',
      table: { category: 'Suggestions', defaultValue: { summary: 'false' } },
    },
    loading: { control: 'boolean', table: { category: 'State' } },
    onSearch: { action: 'search', table: { disable: true } },
    onSuggestionSelected: { action: 'suggestionSelected', table: { disable: true } },
  },
  args: {
    label: 'Search customers',
    value: '',
    placeholder: 'Search...',
    size: 'large',
    state: 'default',
    required: false,
    showLabel: true,
    ariaLabel: 'Search customers',
    suggestions: [],
    expanded: false,
    loading: false,
    onSearch: fn(),
    onSuggestionSelected: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-search
        [label]="label"
        [value]="value"
        [placeholder]="placeholder"
        [size]="size"
        [state]="state"
        [required]="required"
        [showLabel]="showLabel"
        [ariaLabel]="ariaLabel"
        [suggestions]="suggestions"
        [expanded]="expanded"
        [loading]="loading"
        (valueChange)="value = $event"
        (search)="onSearch($event)"
        (suggestionSelected)="onSuggestionSelected($event)"
      ></dds-search>
    `,
  }),
};

export default meta;
type Story = StoryObj<SearchStoryArgs>;

export const Playground: Story = {};

export const Default: Story = {};

export const Filled: Story = {
  args: { value: 'Acme' },
};

export const Focused: Story = {
  args: { state: 'focused' },
};

export const Small: Story = {
  args: { size: 'small' },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Loading search')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.queryByRole('combobox')).not.toBeInTheDocument();
  },
};

export const WithSuggestions: Story = {
  name: 'With suggestions',
  args: {
    value: 'Customer',
    state: 'focused',
    suggestions: exampleSuggestions,
    expanded: true,
  },
};

export const WithoutVisibleLabel: Story = {
  name: 'Without visible label',
  args: {
    showLabel: false,
    ariaLabel: 'Search customers',
  },
};

export const KeyboardSelection: Story = {
  name: 'Keyboard selection',
  args: {
    suggestions: exampleSuggestions,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Search customers' });

    await userEvent.click(input);
    await userEvent.type(input, 'Customer');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    await expect(input).toHaveValue('Customer orders');
    await expect(args.onSuggestionSelected).toHaveBeenCalledWith('Customer orders');
  },
};

export const SubmitQuery: Story = {
  name: 'Submit query',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Search customers' });

    await userEvent.type(input, 'Acme logistics{Enter}');
    await expect(args.onSearch).toHaveBeenCalledWith('Acme logistics');
  },
};
