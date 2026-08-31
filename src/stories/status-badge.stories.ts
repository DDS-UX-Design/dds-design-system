import type { Meta, StoryObj } from '@storybook/angular';
import { StatusBadgeComponent } from '../app/components/status-badge/status-badge.component';

const meta: Meta<StatusBadgeComponent> = {
  title: 'Components/Data Display/Status Badge',
  component: StatusBadgeComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Status badges communicate the current state of an item using a concise label and supporting semantic colour. Choose a tone based on meaning, not visual preference alone.',
      },
    },
  },
  args: { text: 'Informative', tone: 'info', size: 'large' },
  argTypes: {
    tone: { control: 'select', options: ['info', 'success', 'warning', 'danger', 'neutral'] },
    size: { control: 'radio', options: ['large', 'small'] },
  },
};

export default meta;
type Story = StoryObj<StatusBadgeComponent>;

export const Informative: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use Informative for non-critical states that provide context, such as New, Scheduled, or In progress.',
      },
    },
  },
};

export const Success: Story = {
  args: { text: 'Success', tone: 'success' },
  parameters: {
    docs: {
      description: {
        story:
          'Use Success for positive or completed states, such as Active, Approved, Completed, or Delivered.',
      },
    },
  },
};

export const Warning: Story = {
  args: { text: 'Warning', tone: 'warning' },
  parameters: {
    docs: {
      description: {
        story:
          'Use Warning when an item needs attention but has not failed, such as Pending, Awaiting review, or Expiring soon.',
      },
    },
  },
};

export const Danger: Story = {
  args: { text: 'Danger', tone: 'danger' },
  parameters: {
    docs: {
      description: {
        story:
          'Use Danger for failed, blocked, or high-risk states, such as Failed, Rejected, Suspended, or Expired.',
      },
    },
  },
};

export const Neutral: Story = {
  args: { text: 'Draft', tone: 'neutral' },
  parameters: {
    docs: {
      description: {
        story:
          'Use Neutral for states without positive or negative meaning, such as Draft, Inactive, Archived, or Not started.',
      },
    },
  },
};

export const Small: Story = {
  args: { size: 'small' },
  parameters: {
    docs: {
      description: {
        story:
          'Use the Small size in compact layouts such as data-table cells. It carries the same semantic meaning as the Large badge.',
      },
    },
  },
};
