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
      control: { type: 'range', min: 12, max: 48, step: 4 }
    },
    strokeWidth: {
      table: {
        disable: true,
      },
    },
    decorative: {
      control: 'boolean',
      table: {
        disable: true,
      },
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
  render: (args) => {
    const iconMarkup = DDS_ICON_NAMES.map((iconName: DdsIconName) => `
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px; min-width:120px;">
        <dds-icon name="${iconName}" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <span style="font-size:12px; color:#5b6470;">${iconName}</span>
      </div>
    `).join('');

    return {
      props: args,
      template: `
        <div style="display:flex; align-items:flex-start; gap:32px; flex-wrap: wrap;">
          ${iconMarkup}
        </div>
      `
    };
  }
};
