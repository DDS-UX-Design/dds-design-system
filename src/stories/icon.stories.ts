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
  title: 'Foundations/Icons',
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
      description:
        'Hides the icon from assistive technology. Keep enabled when nearby text already conveys its meaning.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    title: {
      control: 'text',
      description: 'Accessible title required when the icon conveys meaning on its own.',
      if: { arg: 'decorative', eq: false },
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
    title: undefined,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Icons provide compact visual cues using the approved Lucide set. Icons are decorative by default; when an icon communicates meaning without an adjacent label, set decorative to false and provide a concise title. Prefer the standard 16–24px range in product interfaces.',
      },
    },
    controls: {
      exclude: ['strokeWidth'],
    },
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<IconStoryArgs>;

export const Default: Story = {
  args: {
    size: 24,
  },
};

export const Accessible: Story = {
  args: {
    decorative: false,
    name: 'circle-alert',
    title: 'Warning',
    size: 24,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Non-decorative icons need a short accessible title that communicates their meaning.',
      },
    },
  },
};

export const Library: Story = {
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
    docs: {
      description: {
        story: 'The complete approved icon library. Use the displayed name with the name input.',
      },
    },
    layout: 'padded',
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
