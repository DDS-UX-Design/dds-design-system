import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ToastComponent, ToastSize, ToastTone } from '../app/components/toast/toast.component';

type ToastStoryArgs = {
  tone: ToastTone;
  size: ToastSize;
  title: string;
  message: string;
  showTitle: boolean;
  dismissible: boolean;
  autoDismiss: boolean;
  duration: number;
  onDismiss: ReturnType<typeof fn>;
};

const meta: Meta<ToastStoryArgs> = {
  title: 'Components/Feedback/Toast',
  component: ToastComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toasts provide brief feedback after an action or background event. Info and Success dismiss automatically and show a progress bar for the remaining time. Warning and Danger are persistent and require dismissal with the close control. Use an inline Alert instead when information must remain in the page context.',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'radio',
      options: ['info', 'warning', 'success', 'danger'],
      description: 'Semantic meaning and visual treatment of the notification.',
      table: { category: 'Appearance', defaultValue: { summary: 'info' } },
    },
    size: {
      control: 'radio',
      options: ['large', 'small'],
      description: 'Typography and icon scale from the design specification.',
      table: { category: 'Appearance', defaultValue: { summary: 'large' } },
    },
    title: {
      control: 'text',
      description: 'Concise summary of the notification.',
      if: { arg: 'showTitle', eq: true },
      table: { category: 'Content' },
    },
    message: {
      control: 'text',
      description: 'Supporting detail that explains the outcome.',
      table: { category: 'Content' },
    },
    showTitle: {
      control: 'boolean',
      description: 'Shows or hides the optional title.',
      table: { category: 'Content', defaultValue: { summary: 'true' } },
    },
    dismissible: {
      control: 'boolean',
      description:
        'Shows a close control on timed Info and Success toasts. Warning and Danger always retain their close control.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    autoDismiss: {
      control: 'boolean',
      description:
        'Starts the progress countdown for Info and Success. Warning and Danger remain persistent.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    duration: {
      control: { type: 'range', min: 1000, max: 15000, step: 500 },
      description: 'Countdown duration for Info and Success. Warning and Danger ignore this value.',
      if: { arg: 'autoDismiss', eq: true },
      table: { category: 'Behavior', defaultValue: { summary: '5000' } },
    },
    onDismiss: { table: { disable: true } },
  },
  args: {
    tone: 'info',
    size: 'large',
    title: 'Account updated',
    message: 'Your contact preferences have been saved.',
    showTitle: true,
    dismissible: true,
    autoDismiss: false,
    duration: 5000,
    onDismiss: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-toast
        [tone]="tone"
        [size]="size"
        [title]="title"
        [message]="message"
        [showTitle]="showTitle"
        [dismissible]="dismissible"
        [autoDismiss]="autoDismiss"
        [duration]="duration"
        (dismissed)="onDismiss()"
      ></dds-toast>
    `,
  }),
};

export default meta;
type Story = StoryObj<ToastStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Enable autoDismiss in Controls to start the progress bar and timed dismissal. Change duration to inspect different countdown lengths.',
      },
    },
  },
};

export const Info: Story = {};

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Connection unstable',
    message: 'Some updates may take longer than usual.',
  },
  parameters: {
    docs: { description: { story: 'Persistent until the close control is activated.' } },
  },
};

export const Success: Story = {
  args: {
    tone: 'success',
    title: 'Report exported',
    message: 'Your report is ready in Downloads.',
  },
  parameters: {
    docs: { description: { story: 'Dismisses automatically when its progress bar ends.' } },
  },
};

export const Danger: Story = {
  args: {
    tone: 'danger',
    title: 'Upload failed',
    message: 'Check your connection and try again.',
  },
  parameters: {
    docs: { description: { story: 'Persistent until the close control is activated.' } },
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    title: 'Preferences saved',
    message: 'Your notification settings are up to date.',
  },
};

export const WithoutTitle: Story = {
  name: 'Without title',
  args: {
    showTitle: false,
    message: 'A new version of the dashboard is available.',
  },
};

export const Persistent: Story = {
  args: {
    tone: 'warning',
    title: 'Review required',
    message: 'Check the flagged records before continuing.',
  },
};

export const AutoDismiss: Story = {
  name: 'Auto-dismiss countdown',
  args: {
    tone: 'success',
    title: 'Import complete',
    message: 'All 48 records were imported successfully.',
    autoDismiss: true,
    duration: 8000,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The progress bar shrinks over eight seconds. When it reaches zero, the toast disappears and emits dismissed.',
      },
    },
  },
};

export const DismissInteraction: Story = {
  name: 'Dismiss interaction',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss notification' }));
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  },
};
