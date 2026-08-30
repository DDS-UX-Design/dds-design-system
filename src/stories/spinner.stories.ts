import type { Meta, StoryObj } from '@storybook/angular';
import { SpinnerComponent, SpinnerSize } from '../app/components/spinner/spinner.component';

type SpinnerStoryArgs = { size: SpinnerSize; label: string; animated: boolean };

const meta: Meta<SpinnerStoryArgs> = {
  title: 'Components/Loading/Spinner',
  component: SpinnerComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Spinner for indeterminate loading. Mobile is 40px and Desktop is 80px, using the exact exported Figma artwork with smooth continuous rotation. Always provide a short label that describes what is loading.',
      },
    },
  },
  argTypes: {
    size: { control: 'radio', options: ['mobile', 'desktop'], table: { category: 'Appearance' } },
    label: { control: 'text', table: { category: 'Accessibility' } },
    animated: { control: 'boolean', table: { category: 'Behavior' } },
  },
  args: { size: 'mobile', label: 'Loading', animated: true },
  render: (args) => ({
    props: args,
    template: `<dds-spinner [size]="size" [label]="label" [animated]="animated"></dds-spinner>`,
  }),
};

export default meta;
type Story = StoryObj<SpinnerStoryArgs>;

export const Playground: Story = {};
export const Mobile: Story = {};
export const Desktop: Story = { args: { size: 'desktop' } };
export const StaticFrame: Story = { args: { size: 'desktop', animated: false } };
