import type { Meta, StoryObj } from '@storybook/angular';
import { StatusBadgeComponent } from '../app/components/status-badge/status-badge.component';

const meta: Meta<StatusBadgeComponent> = {
  title: 'Components/Data Display/Status Badge',
  component: StatusBadgeComponent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { text: 'Informative', tone: 'info', size: 'large' },
  argTypes: {
    tone: { control: 'select', options: ['info', 'success', 'warning', 'danger', 'neutral'] },
    size: { control: 'radio', options: ['large', 'small'] },
  },
};

export default meta;
type Story = StoryObj<StatusBadgeComponent>;

export const Informative: Story = {};
export const Success: Story = { args: { text: 'Success', tone: 'success' } };
export const Warning: Story = { args: { text: 'Warning', tone: 'warning' } };
export const Danger: Story = { args: { text: 'Danger', tone: 'danger' } };
export const Neutral: Story = { args: { text: 'Inactive', tone: 'neutral' } };
export const Small: Story = { args: { size: 'small' } };
