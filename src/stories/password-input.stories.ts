import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import {
  PasswordInputComponent,
  PasswordInputSize,
  PasswordInputState,
} from '../app/components/password-input/password-input.component';

type PasswordInputStoryArgs = {
  label: string;
  placeholder: string;
  value: string;
  errorMessage: string;
  size: PasswordInputSize;
  state: PasswordInputState;
  required: boolean;
  showLabel: boolean;
  showErrorMessage: boolean;
  ariaLabel?: string;
  visible: boolean;
  disabled: boolean;
  name: string;
  autocomplete: string;
  loading: boolean;
};

const meta: Meta<PasswordInputStoryArgs> = {
  title: 'Components/Forms/Password Input',
  component: PasswordInputComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A password field with an optional label, required indicator, visibility toggle, and validation message. Use autocomplete="current-password" for sign-in and autocomplete="new-password" when creating or resetting a password. Error text should explain how to resolve the problem rather than only naming it.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Visible field label.',
      table: { category: 'Content', defaultValue: { summary: 'Password' } },
    },
    placeholder: {
      control: 'text',
      description: 'Short input hint; it does not replace a label.',
      table: { category: 'Content', defaultValue: { summary: 'Enter password' } },
    },
    value: {
      control: 'text',
      description: 'Current password value.',
      table: { category: 'Content' },
    },
    errorMessage: {
      control: 'text',
      description: 'Validation guidance displayed in the error state.',
      if: { arg: 'state', eq: 'error' },
      table: { category: 'Validation' },
    },
    size: {
      control: 'radio',
      options: ['desktop', 'mobile'],
      description: 'Responsive size treatment from the design specification.',
      table: { category: 'Appearance', defaultValue: { summary: 'desktop' } },
    },
    state: {
      control: 'radio',
      options: ['default', 'focused', 'error'],
      description: 'Deterministic visual state for documentation and validation.',
      table: { category: 'State', defaultValue: { summary: 'default' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the native input as required and shows the required indicator.',
      table: { category: 'Validation', defaultValue: { summary: 'false' } },
    },
    showLabel: {
      control: 'boolean',
      description: 'Shows the visible label. Provide another accessible name if hidden.',
      table: { category: 'Content', defaultValue: { summary: 'true' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name required when the visible label is hidden.',
      if: { arg: 'showLabel', eq: false },
      table: { category: 'Accessibility' },
    },
    showErrorMessage: {
      control: 'boolean',
      description: 'Shows validation guidance beneath an error field.',
      if: { arg: 'state', eq: 'error' },
      table: { category: 'Validation', defaultValue: { summary: 'true' } },
    },
    visible: {
      control: 'boolean',
      description: 'Shows the password value as plain text when enabled.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents editing and visibility changes.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    name: {
      control: 'text',
      description: 'Native form field name.',
      table: { category: 'Form' },
    },
    autocomplete: {
      control: 'select',
      options: ['current-password', 'new-password', 'off'],
      description: 'Helps browsers and password managers fill the correct credential.',
      table: { category: 'Form', defaultValue: { summary: 'current-password' } },
    },
    loading: { control: 'boolean', table: { category: 'State' } },
  },
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    value: '',
    errorMessage: 'Password is required',
    size: 'desktop',
    state: 'default',
    required: true,
    showLabel: true,
    showErrorMessage: true,
    ariaLabel: 'Password',
    visible: false,
    disabled: false,
    name: 'password',
    autocomplete: 'current-password',
    loading: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-password-input
        [label]="label"
        [placeholder]="placeholder"
        [value]="value"
        [errorMessage]="errorMessage"
        [size]="size"
        [state]="state"
        [required]="required"
        [showLabel]="showLabel"
        [showErrorMessage]="showErrorMessage"
        [ariaLabel]="ariaLabel"
        [visible]="visible"
        [disabled]="disabled"
        [name]="name"
        [autocomplete]="autocomplete"
        [loading]="loading"
        (valueChange)="value = $event"
        (visibleChange)="visible = $event"
      ></dds-password-input>
    `,
  }),
};

export default meta;
type Story = StoryObj<PasswordInputStoryArgs>;

export const Playground: Story = {};

export const Default: Story = {};

export const Filled: Story = {
  args: {
    value: 'CorrectHorseBatteryStaple',
  },
};

export const Focused: Story = {
  args: {
    state: 'focused',
  },
};

export const Error: Story = {
  args: {
    state: 'error',
    value: '',
    errorMessage: 'Password is required',
  },
};

export const Mobile: Story = {
  args: {
    size: 'mobile',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
};

export const Disabled: Story = {
  args: {
    value: 'UnavailablePassword',
    disabled: true,
  },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Loading password input')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await expect(
      canvas.queryByLabelText(/^Password(?:\s*\*)?$/, { selector: 'input' }),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const VisibilityToggle: Story = {
  name: 'Visibility toggle',
  args: {
    value: 'CorrectHorseBatteryStaple',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Password inputs have no implicit textbox role; allow the label's required indicator.
    const input = canvas.getByLabelText(/^Password(?:\s*\*)?$/, { selector: 'input' });
    const toggle = canvas.getByRole('button', { name: 'Show password' });

    await expect(input).toHaveAccessibleName('Password');
    await expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(toggle);
    await expect(input).toHaveAttribute('type', 'text');
    await expect(canvas.getByRole('button', { name: 'Hide password' })).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(input).toHaveValue('CorrectHorseBatteryStaple');
    await userEvent.click(canvas.getByRole('button', { name: 'Hide password' }));
    await expect(input).toHaveAttribute('type', 'password');
    await expect(canvas.getByRole('button', { name: 'Show password' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(input).toHaveValue('CorrectHorseBatteryStaple');
  },
};
