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
      options: DDS_ICON_NAMES,
      description: 'The icon name to render.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'info'" },
      },
    },
    size: {
      control: { type: 'range', min: 12, max: 48, step: 4 },
      description: 'The icon size in pixels.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '24' },
      },
    },
    strokeWidth: {
      description: 'The stroke width of the SVG icon.',
      table: {
        disable: true,
        type: { summary: 'number | string' },
        defaultValue: { summary: '2' },
      },
    },
    decorative: {
      control: 'boolean',
      description: 'Removes the icon title from the accessibility tree when enabled.',
      table: {
        disable: true,
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    title: {
      control: 'text',
      description: 'Accessible title shown when the icon is not decorative.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
  args: {
    name: 'info',
    size: 20,
    strokeWidth: 2,
    decorative: true,
    title: 'Info',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A reusable icon component that renders SVG icons from the Lucide library.'
      },
    },
    controls: {
      exclude: ['strokeWidth', 'decorative', 'title'],
    },
  },
};

export default meta;
type Story = StoryObj<IconStoryArgs>;

export const Default: Story = {
  args: {
    size: 24,
  },
};

export const IconSetPreview: Story = {
  args: {
    decorative: false,
    size: 24,
    strokeWidth: 2,
    name: 'arrow-right',
    title: undefined,
  },
  parameters: {
    controls: {
      exclude: ['name', 'strokeWidth', 'decorative', 'title'],
    },
  },
  render: (args) => {
    const iconMarkup = DDS_ICON_NAMES.map(
      (iconName: DdsIconName) => `
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px; min-width:120px;">
        <dds-icon name="${iconName}" [size]="size" [strokeWidth]="strokeWidth"></dds-icon>
        <span style="font-size:12px; color:#5b6470;">${iconName}</span>
      </div>
    `,
    ).join('');

    return {
      props: args,
      template: `
        <div style="display:flex; align-items:flex-start; gap:32px; flex-wrap: wrap;">
          ${iconMarkup}
        </div>
      `,
    };
  },
};
