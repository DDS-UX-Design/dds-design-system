import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import {
  TextInputComponent,
  TextInputSize,
  TextInputState,
} from '../app/components/text-input/text-input.component';

type TextInputStoryArgs = {
  label: string;
  placeholder: string;
  value: string;
  helperText: string;
  errorMessage: string;
  size: TextInputSize;
  state: TextInputState;
  required: boolean;
  showLabel: boolean;
  showHelperText: boolean;
  showErrorMessage: boolean;
  ariaLabel?: string;
  disabled: boolean;
  name: string;
  autocomplete: string;
  maxLength?: number;
};

const meta: Meta<TextInputStoryArgs> = {
  title: 'Components/Forms/Text Input',
  component: TextInputComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A single-line text field with desktop and mobile sizing, optional supporting text, validation messaging, and native form behavior. Keep a visible label whenever possible; placeholder text is supplemental guidance, not an accessible name.',
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
    maxLength: { control: 'number', table: { category: 'Validation' } },
  },
  args: {
    label: 'Label Text',
    placeholder: 'Placeholder text...',
    value: '',
    helperText: 'Helper text',
    errorMessage: 'Error message',
    size: 'desktop',
    state: 'default',
    required: true,
    showLabel: true,
    showHelperText: true,
    showErrorMessage: true,
    ariaLabel: 'Text input',
    disabled: false,
    name: 'text-input',
    autocomplete: 'off',
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-text-input
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
        [maxLength]="maxLength"
        (valueChange)="value = $event"
      ></dds-text-input>
    `,
  }),
};

export default meta;
type Story = StoryObj<TextInputStoryArgs>;

export const Playground: Story = {};
export const Default: Story = {};
export const Filled: Story = { args: { value: 'Field text' } };
export const Focused: Story = { args: { state: 'focused' } };
export const Error: Story = {
  args: { state: 'error', value: 'Invalid value', errorMessage: 'Review this value and try again' },
};
export const Mobile: Story = {
  args: { size: 'mobile' },
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
export const Disabled: Story = { args: { value: 'Field text', disabled: true } };
export const WithoutVisibleLabel: Story = {
  args: { showLabel: false, ariaLabel: 'Text input' },
};
export const Entry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Label Text');
    await userEvent.type(input, 'Field text');
    await expect(input).toHaveValue('Field text');
  },
};
