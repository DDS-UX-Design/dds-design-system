import type { Meta, StoryObj } from '@storybook/angular';
import { DdsIconName, DDS_ICON_NAMES, IconComponent } from '../app/components/icon/icon.component';

type IconStoryArgs = {
  name: DdsIconName;
  size: number;
  strokeWidth: number;
  decorative: boolean;
  title?: string;
};

const meta: Meta<IconStoryArgs> = {
  title: 'Foundations/Icon',
  component: IconComponent,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: DDS_ICON_NAMES
    },
    size: {
      control: { type: 'range', min: 12, max: 48, step: 1 }
    },
    strokeWidth: {
      control: { type: 'range', min: 1, max: 3, step: 0.25 }
    },
    decorative: {
      control: 'boolean'
    },
    title: {
      control: 'text'
    }
  },
  args: {
    name: 'info',
    size: 20,
    strokeWidth: 2,
    decorative: true,
    title: 'Info'
  }
};

export default meta;
type Story = StoryObj<IconStoryArgs>;

export const Default: Story = {};

export const IconSetPreview: Story = {
  args: {
    decorative: true,
    size: 20,
    strokeWidth: 2,
    name: 'arrow-right',
    title: undefined
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:12px; align-items:center; flex-wrap: wrap;">
        <dds-icon name="info" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="arrow-right" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="arrow-left" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="arrow-down" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="arrow-up" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="plus" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="ellipsis" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="trash-2" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="check" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="x" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="circle-alert" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <dds-icon name="chevron-down" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
      </div>
    `
  })
};
