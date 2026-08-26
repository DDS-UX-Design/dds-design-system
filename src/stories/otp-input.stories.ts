import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  OtpInputComponent,
  OtpInputSize,
  OtpInputState,
} from '../app/components/otp-input/otp-input.component';

type OtpInputStoryArgs = {
  label: string;
  value: string;
  size: OtpInputSize;
  state: OtpInputState;
  required: boolean;
  showLabel: boolean;
  ariaLabel: string;
  errorMessage: string;
  showErrorMessage: boolean;
  showCodeExpiry: boolean;
  codeExpired: boolean;
  expiryTime: string;
  onComplete: ReturnType<typeof fn>;
};

const meta: Meta<OtpInputStoryArgs> = {
  title: 'Components/Forms/OTP Input',
  component: OtpInputComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A six-digit one-time-code input for verification and authentication. The segmented presentation uses one native input so users can type, paste a complete code, or accept one-time-code autofill. Always provide clear expiry, error, and resend guidance around the component.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Visible field label.',
      if: { arg: 'showLabel', eq: true },
      table: { category: 'Content' },
    },
    value: {
      control: 'text',
      description: 'Current six-digit numeric code.',
      table: { category: 'Content' },
    },
    size: {
      control: 'radio',
      options: ['desktop', 'mobile'],
      description: 'Responsive dimensions from the design specification.',
      table: { category: 'Appearance', defaultValue: { summary: 'desktop' } },
    },
    state: {
      control: 'radio',
      options: ['default', 'focused', 'error', 'disabled-loading'],
      description: 'Visual state used for interaction, validation, or loading.',
      table: { category: 'State', defaultValue: { summary: 'default' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the native field as required.',
      table: { category: 'Validation', defaultValue: { summary: 'true' } },
    },
    showLabel: {
      control: 'boolean',
      description: 'Shows the visible label. An accessible name remains when hidden.',
      table: { category: 'Content', defaultValue: { summary: 'false' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name used when the visible label is hidden.',
      if: { arg: 'showLabel', eq: false },
      table: { category: 'Accessibility' },
    },
    errorMessage: {
      control: 'text',
      description: 'Guidance explaining how to resolve the validation error.',
      if: { arg: 'state', eq: 'error' },
      table: { category: 'Validation' },
    },
    showErrorMessage: {
      control: 'boolean',
      description: 'Shows validation guidance beneath an error field.',
      if: { arg: 'state', eq: 'error' },
      table: { category: 'Validation', defaultValue: { summary: 'true' } },
    },
    showCodeExpiry: {
      control: 'boolean',
      description: 'Shows the remaining time or expired status.',
      table: { category: 'Expiry', defaultValue: { summary: 'true' } },
    },
    codeExpired: {
      control: 'boolean',
      description: 'Displays the expired-code treatment.',
      if: { arg: 'showCodeExpiry', eq: true },
      table: { category: 'Expiry', defaultValue: { summary: 'false' } },
    },
    expiryTime: {
      control: 'text',
      description: 'Formatted time remaining, supplied by the consuming application.',
      if: { arg: 'codeExpired', eq: false },
      table: { category: 'Expiry', defaultValue: { summary: '02:57' } },
    },
    onComplete: { table: { disable: true } },
  },
  args: {
    label: 'Verification code',
    value: '',
    size: 'desktop',
    state: 'default',
    required: true,
    showLabel: false,
    ariaLabel: 'Six-digit verification code',
    errorMessage: 'Enter the complete six-digit code.',
    showErrorMessage: true,
    showCodeExpiry: true,
    codeExpired: false,
    expiryTime: '02:57',
    onComplete: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-otp-input
        [label]="label"
        [value]="value"
        [size]="size"
        [state]="state"
        [required]="required"
        [showLabel]="showLabel"
        [ariaLabel]="ariaLabel"
        [errorMessage]="errorMessage"
        [showErrorMessage]="showErrorMessage"
        [showCodeExpiry]="showCodeExpiry"
        [codeExpired]="codeExpired"
        [expiryTime]="expiryTime"
        (valueChange)="value = $event"
        (completed)="onComplete($event)"
      ></dds-otp-input>
    `,
  }),
};

export default meta;
type Story = StoryObj<OtpInputStoryArgs>;

export const Playground: Story = {};

export const Default: Story = {};

export const Filled: Story = {
  args: { value: '378531' },
};

export const Focused: Story = {
  args: { state: 'focused', value: '3' },
};

export const Error: Story = {
  args: {
    state: 'error',
    value: '37853',
    errorMessage: 'The code must contain all six digits.',
  },
};

export const Expired: Story = {
  args: {
    value: '378531',
    codeExpired: true,
  },
};

export const DisabledLoading: Story = {
  name: 'Disabled / Loading',
  args: {
    state: 'disabled-loading',
    value: '378531',
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

export const PasteCompleteCode: Story = {
  name: 'Paste complete code',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Six-digit verification code');

    await userEvent.click(input);
    await userEvent.paste('378531');

    await expect(input).toHaveValue('378531');
    await expect(args.onComplete).toHaveBeenCalledWith('378531');
  },
};
