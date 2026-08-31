import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import {
  DateInputComponent,
  DateInputSize,
  DateInputState,
} from '../app/components/date-input/date-input.component';

type DateInputStoryArgs = {
  label: string;
  placeholder: string;
  value: string;
  helperText: string;
  errorMessage: string;
  size: DateInputSize;
  state: DateInputState;
  required: boolean;
  showLabel: boolean;
  showHelperText: boolean;
  showErrorMessage: boolean;
  ariaLabel?: string;
  disabled: boolean;
  name: string;
  autocomplete: string;
  loading: boolean;
};

const meta: Meta<DateInputStoryArgs> = {
  title: 'Components/Forms/Date Input',
  component: DateInputComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A date text field matching the current Figma specification. It accepts a formatted date but intentionally does not include a calendar or date-range picker; those interactions remain in the Figma backlog.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Content' } },
    placeholder: { control: 'text', table: { category: 'Content' } },
    value: { control: 'text', table: { category: 'Content' } },
    helperText: { control: 'text', table: { category: 'Content' } },
    errorMessage: {
      control: 'text',
      if: { arg: 'state', eq: 'error' },
      table: { category: 'Validation' },
    },
    size: { control: 'radio', options: ['desktop', 'mobile'], table: { category: 'Appearance' } },
    state: {
      control: 'radio',
      options: ['default', 'focused', 'error'],
      table: { category: 'State' },
    },
    required: { control: 'boolean', table: { category: 'Validation' } },
    showLabel: { control: 'boolean', table: { category: 'Content' } },
    showHelperText: { control: 'boolean', table: { category: 'Content' } },
    showErrorMessage: { control: 'boolean', table: { category: 'Validation' } },
    ariaLabel: {
      control: 'text',
      if: { arg: 'showLabel', eq: false },
      table: { category: 'Accessibility' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    name: { control: 'text', table: { category: 'Form' } },
    autocomplete: { control: 'text', table: { category: 'Form' } },
    loading: { control: 'boolean', table: { category: 'State' } },
  },
  args: {
    label: 'Date',
    placeholder: 'DD/MM/YYYY',
    value: '',
    helperText: 'Enter the date in DD/MM/YYYY format',
    errorMessage: 'Enter a valid date in DD/MM/YYYY format',
    size: 'desktop',
    state: 'default',
    required: true,
    showLabel: true,
    showHelperText: true,
    showErrorMessage: true,
    ariaLabel: 'Date',
    disabled: false,
    name: 'date',
    autocomplete: 'off',
    loading: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-date-input
        [label]="label"
        [placeholder]="placeholder"
        [value]="value"
        [helperText]="helperText"
        [errorMessage]="errorMessage"
        [size]="size"
        [state]="state"
        [required]="required"
        [showLabel]="showLabel"
        [showHelperText]="showHelperText"
        [showErrorMessage]="showErrorMessage"
        [ariaLabel]="ariaLabel"
        [disabled]="disabled"
        [name]="name"
        [autocomplete]="autocomplete"
        [loading]="loading"
        (valueChange)="value = $event"
      ></dds-date-input>
    `,
  }),
};

export default meta;
type Story = StoryObj<DateInputStoryArgs>;

export const Playground: Story = {};
export const Default: Story = {};
export const Filled: Story = { args: { value: '23/05/2026' } };
export const Focused: Story = { args: { state: 'focused' } };
export const Error: Story = { args: { state: 'error', value: '31/02/2026' } };
export const Mobile: Story = {
  args: { size: 'mobile' },
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
export const Disabled: Story = { args: { value: '23/05/2026', disabled: true } };
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Loading date input')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};
export const Entry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Date');
    await userEvent.type(input, '23/05/2026');
    await expect(input).toHaveValue('23/05/2026');
  },
};
