import type { Meta, StoryObj } from '@storybook/angular';
import { SkeletonComponent } from '../app/components/skeleton/skeleton.component';

type SkeletonStoryArgs = {
  width: string | number;
  height: string | number;
  animated: boolean;
};

const meta: Meta<SkeletonStoryArgs> = {
  title: 'Components/Loading/Skeleton',
  component: SkeletonComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Skeletons reserve space while content is loading. The base 230×16px treatment matches the Figma text skeleton. Skeleton shapes are decorative; announce the loading region separately when users need status information.',
      },
    },
  },
  argTypes: {
    width: { control: 'text', table: { category: 'Layout' } },
    height: { control: 'text', table: { category: 'Layout' } },
    animated: { control: 'boolean', table: { category: 'Behavior' } },
  },
  args: { width: 230, height: 16, animated: true },
  render: (args) => ({
    props: args,
    template: `<dds-skeleton [width]="width" [height]="height" [animated]="animated"></dds-skeleton>`,
  }),
};

export default meta;
type Story = StoryObj<SkeletonStoryArgs>;

export const Playground: Story = {};
export const Text: Story = {};
export const Static: Story = { args: { animated: false } };
export const TextBlock: Story = {
  render: () => ({
    template: `
      <div aria-busy="true" aria-label="Loading article" style="display:grid; gap:12px; width:min(420px, 80vw)">
        <dds-skeleton width="55%"></dds-skeleton>
        <dds-skeleton width="100%"></dds-skeleton>
        <dds-skeleton width="92%"></dds-skeleton>
        <dds-skeleton width="72%"></dds-skeleton>
      </div>
    `,
  }),
};
