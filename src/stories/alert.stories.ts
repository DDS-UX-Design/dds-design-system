import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AlertComponent, AlertSize, AlertTone } from '../app/components/alert/alert.component';

type AlertStoryArgs = {
  tone: AlertTone;
  size: AlertSize;
  text: string;
  showIcon: boolean;
  dismissible: boolean;
  showAction: boolean;
  actionLabel: string;
  onDismiss: ReturnType<typeof fn>;
  onAction: ReturnType<typeof fn>;
};

const meta: Meta<AlertStoryArgs> = {
  title: 'Components/Feedback/Alert',
  component: AlertComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Alerts communicate important contextual information within a page. Choose the tone by meaning, keep the message concise, and reserve Danger for problems that require attention. Use an action only when the user can resolve or continue from the alert.',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'radio',
      options: ['info', 'warning', 'success', 'danger'],
      description: 'Semantic meaning and visual treatment of the alert.',
      table: { category: 'Appearance', defaultValue: { summary: 'info' } },
    },
    size: {
      control: 'radio',
      options: ['web', 'mobile'],
      description: 'Responsive density and typography from the design specification.',
      table: { category: 'Appearance', defaultValue: { summary: 'web' } },
    },
    text: {
      control: 'text',
      description: 'Concise message explaining the status or required action.',
      table: { category: 'Content' },
    },
    showIcon: {
      control: 'boolean',
      description: 'Shows the semantic status icon.',
      table: { category: 'Content', defaultValue: { summary: 'true' } },
    },
    dismissible: {
      control: 'boolean',
      description: 'Allows users to dismiss a non-persistent alert.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    showAction: {
      control: 'boolean',
      description: 'Shows an optional Secondary action button.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    actionLabel: {
      control: 'text',
      description: 'Verb-led label for the optional action.',
      if: { arg: 'showAction', eq: true },
      table: { category: 'Content' },
    },
    onDismiss: { action: 'dismissed', table: { disable: true } },
    onAction: { action: 'action', table: { disable: true } },
  },
  args: {
    tone: 'info',
    size: 'web',
    text: 'Your changes have been saved and are ready to publish.',
    showIcon: true,
    dismissible: true,
    showAction: false,
    actionLabel: 'View changes',
    onDismiss: fn(),
    onAction: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-alert
        [tone]="tone"
        [size]="size"
        [text]="text"
        [showIcon]="showIcon"
        [dismissible]="dismissible"
        [showAction]="showAction"
        [actionLabel]="actionLabel"
        (dismissed)="onDismiss()"
        (action)="onAction()"
      ></dds-alert>
    `,
  }),
};

export default meta;
type Story = StoryObj<AlertStoryArgs>;

export const Playground: Story = {};

export const Info: Story = {};

export const Warning: Story = {
  args: {
    tone: 'warning',
    text: 'Your session expires in five minutes.',
  },
};

export const Success: Story = {
  args: {
    tone: 'success',
    text: 'The customer record was updated successfully.',
  },
};

export const Danger: Story = {
  args: {
    tone: 'danger',
    text: 'We could not save your changes. Try again.',
  },
};

export const Mobile: Story = {
  args: {
    size: 'mobile',
    text: 'Your changes have been saved.',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
};

export const WithAction: Story = {
  name: 'With action',
  args: {
    tone: 'warning',
    text: 'Your payment method expires this month.',
    showAction: true,
    actionLabel: 'Update',
  },
};

export const Persistent: Story = {
  args: {
    tone: 'danger',
    text: 'Resolve the validation errors before continuing.',
    dismissible: false,
  },
};

export const DismissInteraction: Story = {
  name: 'Dismiss interaction',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss alert' }));
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  },
};
