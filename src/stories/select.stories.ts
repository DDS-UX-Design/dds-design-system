import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  SelectComponent,
  SelectOption,
  SelectSize,
  SelectState,
} from '../app/components/select/select.component';

type SelectStoryArgs = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  size: SelectSize;
  state: SelectState;
  required: boolean;
  showLabel: boolean;
  ariaLabel: string;
  helperText: string;
  showHelperText: boolean;
  errorMessage: string;
  loading: boolean;
  onValueChange: ReturnType<typeof fn>;
};

const countryOptions: SelectOption[] = [
  { label: 'Kenya', value: 'ke' },
  { label: 'South Africa', value: 'za' },
  { label: 'United Kingdom', value: 'gb' },
  { label: 'United States', value: 'us' },
];

const meta: Meta<SelectStoryArgs> = {
  title: 'Components/Forms/Select',
  component: SelectComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A native single-select field for choosing one option from a predefined list. Use concise option labels, arrange options in a meaningful order, and provide helper or error text when the choice needs explanation.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Visible label describing the choice.',
      if: { arg: 'showLabel', eq: true },
      table: { category: 'Content' },
    },
    value: {
      control: 'select',
      options: ['', 'ke', 'za', 'gb', 'us'],
      description: 'Currently selected option value.',
      table: { category: 'Content' },
    },
    placeholder: {
      control: 'text',
      description: 'Prompt displayed before an option is selected.',
      table: { category: 'Content' },
    },
    options: {
      control: 'object',
      description: 'Available option labels, values, and optional disabled states.',
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
      options: ['default', 'focused', 'disabled', 'error'],
      description: 'Visual and interaction state of the field.',
      table: { category: 'State', defaultValue: { summary: 'default' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the native select as required and shows the required indicator.',
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
    helperText: {
      control: 'text',
      description: 'Optional guidance shown beneath the field.',
      if: { arg: 'showHelperText', eq: true },
      table: { category: 'Content' },
    },
    showHelperText: {
      control: 'boolean',
      description: 'Shows guidance beneath non-error fields.',
      table: { category: 'Content', defaultValue: { summary: 'true' } },
    },
    errorMessage: {
      control: 'text',
      description: 'Guidance explaining how to resolve the validation error.',
      if: { arg: 'state', eq: 'error' },
      table: { category: 'Validation' },
    },
    loading: { control: 'boolean', table: { category: 'State' } },
    onValueChange: { table: { disable: true } },
  },
  args: {
    label: 'Country',
    value: '',
    placeholder: 'Select country',
    options: countryOptions,
    size: 'large',
    state: 'default',
    required: true,
    showLabel: true,
    ariaLabel: 'Country',
    helperText: 'Choose your country of residence.',
    showHelperText: true,
    errorMessage: 'Select a country to continue.',
    loading: false,
    onValueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-select
        [label]="label"
        [value]="value"
        [placeholder]="placeholder"
        [options]="options"
        [size]="size"
        [state]="state"
        [required]="required"
        [showLabel]="showLabel"
        [ariaLabel]="ariaLabel"
        [helperText]="helperText"
        [showHelperText]="showHelperText"
        [errorMessage]="errorMessage"
        [loading]="loading"
        (valueChange)="value = $event; onValueChange($event)"
      ></dds-select>
    `,
  }),
};

export default meta;
type Story = StoryObj<SelectStoryArgs>;

export const Playground: Story = {};

export const Default: Story = {};

export const Selected: Story = {
  args: { value: 'ke' },
};

export const Focused: Story = {
  args: { state: 'focused' },
};

export const Error: Story = {
  args: { state: 'error' },
};

export const Disabled: Story = {
  args: { state: 'disabled', value: 'ke' },
};

export const Small: Story = {
  args: { size: 'small' },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Loading select')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.queryByRole('combobox')).not.toBeInTheDocument();
  },
};

export const WithoutVisibleLabel: Story = {
  name: 'Without visible label',
  args: {
    showLabel: false,
    ariaLabel: 'Country',
  },
};

export const SelectOptionInteraction: Story = {
  name: 'Select an option',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Country' });

    await userEvent.selectOptions(select, 'za');
    await expect(select).toHaveValue('za');
    await expect(args.onValueChange).toHaveBeenCalledWith('za');
  },
};
