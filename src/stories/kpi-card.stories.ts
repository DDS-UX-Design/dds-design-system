import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { KpiCardComponent } from '../app/components/kpi-card/kpi-card.component';

const meta: Meta<KpiCardComponent> = {
  title: 'Components/Data Display/KPI Card',
  component: KpiCardComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="width: 220px; max-width: 100%">${story}</div>`,
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A compact dashboard card for a single key performance indicator. It supports optional units, positive, neutral, or negative comparative trends, and a skeleton loading state.',
      },
    },
  },
  args: {
    label: 'Active customers',
    value: 142,
    prefix: '',
    suffix: '',
    trend: 'positive',
    trendText: '8.2% vs last month',
    loading: false,
  },
  argTypes: {
    trend: { control: 'select', options: ['positive', 'neutral', 'negative'] },
  },
};

export default meta;
type Story = StoryObj<KpiCardComponent>;

export const Positive: Story = {};
export const Neutral: Story = { args: { trend: 'neutral' } };
export const Negative: Story = { args: { trend: 'negative' } };
export const Currency: Story = {
  args: {
    label: 'Monthly revenue',
    prefix: 'KES',
    value: '248,500',
    trendText: '12.4% vs last month',
  },
};
export const Percentage: Story = {
  args: {
    label: 'Conversion rate',
    value: '14.2',
    suffix: '%',
    trend: 'negative',
    trendText: '1.3% vs last month',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('article', { name: 'Active customers is loading' });

    await expect(card).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.queryByText('142')).not.toBeInTheDocument();
    await expect(canvas.queryByText('8.2% vs last month')).not.toBeInTheDocument();
  },
};

export const AccessibleSummary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('article', { name: 'Active customers: 142. 8.2% vs last month' }),
    ).toBeInTheDocument();
  },
};
