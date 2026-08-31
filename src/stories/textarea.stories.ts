import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  TextareaComponent,
  TextareaSize,
  TextareaState,
} from '../app/components/textarea/textarea.component';

type TextareaStoryArgs = {
  label: string;
  value: string;
  placeholder: string;
  size: TextareaSize;
  state: TextareaState;
  maxLength: number;
  required: boolean;
  showLabel: boolean;
  ariaLabel: string;
  helperText: string;
  showHelperText: boolean;
  errorMessage: string;
  showCharacterCount: boolean;
  loading: boolean;
  onValueChange: ReturnType<typeof fn>;
};

const exampleResponse =
  'I need assistance updating the delivery address for my recent order before it is dispatched.';

const meta: Meta<TextareaStoryArgs> = {
  title: 'Components/Forms/Textarea',
  component: TextareaComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A multi-line field for responses that need more space than a text input. Use a clear label, explain format or length constraints in helper text, and reserve error text for actionable validation guidance.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Visible label describing the response.',
      table: { category: 'Content' },
    },
    value: { control: 'text', description: 'Current field value.', table: { category: 'Content' } },
    placeholder: {
      control: 'text',
      description: 'Short example or prompt shown while the field is empty.',
      table: { category: 'Content' },
    },
    size: {
      control: 'radio',
      options: ['large', 'small'],
      description: 'Large or Small typography treatment from the design specification.',
      table: { category: 'Appearance', defaultValue: { summary: 'large' } },
    },
    state: {
      control: 'radio',
      options: ['default', 'focused', 'disabled', 'error'],
      description: 'Visual and interaction state of the field.',
      table: { category: 'State', defaultValue: { summary: 'default' } },
    },
    maxLength: {
      control: { type: 'number', min: 1, step: 1 },
      description: 'Maximum accepted character count.',
      table: { category: 'Validation', defaultValue: { summary: '150' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required.',
      table: { category: 'Validation' },
    },
    showLabel: {
      control: 'boolean',
      description: 'Shows the visible label.',
      table: { category: 'Content' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name used when the visible label is hidden.',
      if: { arg: 'showLabel', eq: false },
      table: { category: 'Accessibility' },
    },
    helperText: {
      control: 'text',
      description: 'Optional guidance beneath the field.',
      table: { category: 'Content' },
    },
    showHelperText: {
      control: 'boolean',
      description: 'Shows guidance beneath non-error fields.',
      table: { category: 'Content' },
    },
    errorMessage: {
      control: 'text',
      description: 'Actionable validation guidance.',
      if: { arg: 'state', eq: 'error' },
      table: { category: 'Validation' },
    },
    showCharacterCount: {
      control: 'boolean',
      description: 'Shows the live current and maximum character count.',
      table: { category: 'Validation' },
    },
    loading: { control: 'boolean', table: { category: 'State' } },
    onValueChange: { table: { disable: true } },
  },
  args: {
    label: 'Additional information',
    value: '',
    placeholder: 'Tell us how we can help…',
    size: 'large',
    state: 'default',
    maxLength: 150,
    required: true,
    showLabel: true,
    ariaLabel: 'Additional information',
    helperText: 'Include any details that will help us resolve your request.',
    showHelperText: true,
    errorMessage: 'Enter some information before continuing.',
    showCharacterCount: true,
    loading: false,
    onValueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-textarea
        [label]="label"
        [value]="value"
        [placeholder]="placeholder"
        [size]="size"
        [state]="state"
        [maxLength]="maxLength"
        [required]="required"
        [showLabel]="showLabel"
        [ariaLabel]="ariaLabel"
        [helperText]="helperText"
        [showHelperText]="showHelperText"
        [errorMessage]="errorMessage"
        [showCharacterCount]="showCharacterCount"
        [loading]="loading"
        (valueChange)="value = $event; onValueChange($event)"
      ></dds-textarea>
    `,
  }),
};

export default meta;
type Story = StoryObj<TextareaStoryArgs>;

export const Playground: Story = {};

export const Default: Story = {};

export const WithContent: Story = {
  name: 'With content',
  args: { value: exampleResponse },
};

export const Focused: Story = {
  args: { state: 'focused', value: exampleResponse },
};

export const Error: Story = {
  args: { state: 'error', value: '' },
};

export const Disabled: Story = {
  args: { state: 'disabled', value: exampleResponse },
};

export const Small: Story = {
  args: { size: 'small' },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Loading textarea')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};

export const WithoutCharacterCount: Story = {
  name: 'Without character count',
  args: { showCharacterCount: false },
};

export const EnterResponse: Story = {
  name: 'Enter a response',
  args: { maxLength: 40 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: /additional information/i });

    await userEvent.type(textarea, 'Please call me before delivery.');
    await expect(textarea).toHaveValue('Please call me before delivery.');
    await expect(canvas.getByText('31/40')).toBeInTheDocument();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('Please call me before delivery.');
  },
};
