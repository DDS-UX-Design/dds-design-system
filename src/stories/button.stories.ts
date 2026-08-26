import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import {
  ButtonComponent,
  ButtonIconType,
  ButtonSize,
  ButtonState,
  ButtonStyle,
  ButtonVariant,
} from '../app/components/button/button.component';
import { DdsIconName, DDS_ICON_NAMES } from '../app/components/icon/icon.component';

type ButtonStoryArgs = {
  text: string;
  variant: ButtonVariant;
  state: ButtonState;
  styleType: ButtonStyle;
  size: ButtonSize;
  iconType: ButtonIconType;
  icon: DdsIconName;
  ariaLabel?: string;
  disabled: boolean;
  fullWidth: boolean;
  type: 'button' | 'submit' | 'reset';
};

const meta: Meta<ButtonStoryArgs> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Buttons trigger an immediate action. Use Primary for the main action in a view, Secondary for supporting actions, Ghost for low-emphasis actions, and Danger only for destructive actions. Use a concise verb-led label. Icon-only buttons require an ariaLabel, and a view should usually contain only one primary action.',
      },
    },
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Visual treatment that signals the button’s importance and purpose.',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'focused', 'disabled'],
      description: 'Preview state used by design reviews; use disabled for application behavior.',
      table: { category: 'State', defaultValue: { summary: 'default' } },
    },
    styleType: {
      name: 'style',
      control: 'select',
      options: ['default', 'danger'],
      description: 'Semantic style that can switch the button to a destructive treatment.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'radio',
      options: ['large', 'medium', 'small'],
      description: 'Control the height and padding to fit different layouts.',
      table: { category: 'Appearance', defaultValue: { summary: 'large' } },
    },
    iconType: {
      control: 'select',
      options: ['no-icon', 'left-icon', 'right-icon', 'icon-only'],
      description: 'Determines whether an icon appears before, after, or instead of the label.',
      table: { category: 'Content', defaultValue: { summary: 'no-icon' } },
    },
    icon: {
      control: 'select',
      options: DDS_ICON_NAMES,
      description: 'Icon to render when the button uses an icon placement option.',
      if: { arg: 'iconType', neq: 'no-icon' },
      table: { category: 'Content', defaultValue: { summary: 'info' } },
    },
    ariaLabel: {
      control: 'text',
      description:
        'Accessible label required for icon-only buttons when no visible text is present.',
      if: { arg: 'iconType', eq: 'icon-only' },
      table: { category: 'Accessibility' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button and applies the disabled visual treatment.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Expands the button to fill the available width of its container.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Native button type used for forms and semantic button behavior.',
      table: { category: 'Behavior', defaultValue: { summary: 'button' } },
    },
    text: {
      control: 'text',
      description: 'Visible, verb-led label. Hidden when iconType is icon-only.',
      if: { arg: 'iconType', neq: 'icon-only' },
      table: { category: 'Content' },
    },
  },
  args: {
    text: 'Button',
    variant: 'primary',
    state: 'default',
    styleType: 'default',
    size: 'large',
    iconType: 'no-icon',
    icon: 'info',
    ariaLabel: 'Action button',
    disabled: false,
    fullWidth: false,
    type: 'button',
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-button
        [variant]="variant"
        [state]="state"
        [styleType]="styleType"
        [size]="size"
        [iconType]="iconType"
        [icon]="icon"
        [ariaLabel]="ariaLabel"
        [disabled]="disabled"
        [fullWidth]="fullWidth"
        [type]="type"
      >
        {{ text }}
      </dds-button>
    `,
  }),
};

export default meta;
type Story = StoryObj<ButtonStoryArgs>;

const buttonExample = (
  label: string,
  variant: ButtonVariant,
  iconType: ButtonIconType,
  styleType: ButtonStyle = 'default',
) => {
  const icon = styleType === 'danger' ? 'trash-2' : 'arrow-right';
  const content = iconType === 'icon-only' ? '' : label;
  const ariaLabel = iconType === 'icon-only' ? `ariaLabel="${label}"` : '';

  return `<dds-button variant="${variant}" styleType="${styleType}" iconType="${iconType}" icon="${icon}" ${ariaLabel}>${content}</dds-button>`;
};

const comparisonRows = [
  { label: 'Primary', variant: 'primary', styleType: 'default', iconOnly: true },
  { label: 'Secondary', variant: 'secondary', styleType: 'default', iconOnly: true },
  { label: 'Danger', variant: 'primary', styleType: 'danger', iconOnly: true },
  { label: 'Ghost', variant: 'ghost', styleType: 'default', iconOnly: false },
] as const;

const comparisonMarkup = comparisonRows
  .map(({ label, variant, styleType, iconOnly }) => {
    const examples = (['no-icon', 'left-icon', 'right-icon'] as const)
      .map((iconType) => buttonExample(`${label} action`, variant, iconType, styleType))
      .concat(iconOnly ? buttonExample(`${label} action`, variant, 'icon-only', styleType) : [])
      .join('');

    return `<section class="button-comparison__row"><h3>${label}</h3><div class="button-comparison__examples">${examples}</div></section>`;
  })
  .join('');

export const Playground: Story = {
  args: {
    text: 'Continue',
    iconType: 'right-icon',
    icon: 'arrow-right',
    ariaLabel: 'Continue',
  },
  parameters: {
    controls: {
      include: [
        'text',
        'variant',
        'styleType',
        'state',
        'size',
        'iconType',
        'icon',
        'ariaLabel',
        'disabled',
        'fullWidth',
        'type',
      ],
    },
    docs: {
      description: {
        story:
          'Use the Controls panel alongside the Canvas to explore button variants, icon placement, icon choice, states, and sizing.',
      },
    },
  },
};

export const PrimaryDefault: Story = {
  name: 'Primary / Default',
  args: {
    text: 'Save changes',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Save changes' });

    await expect(button).toBeEnabled();
    await expect(button).not.toHaveFocus();
  },
};

export const PrimaryHover: Story = {
  name: 'Primary / Hover',
  args: {
    text: 'Save changes',
    state: 'hover',
  },
  parameters: {
    docs: { description: { story: 'The hover treatment increases visual feedback.' } },
  },
};

export const PrimaryFocused: Story = {
  name: 'Primary / Focused',
  args: {
    text: 'Save changes',
    state: 'focused',
  },
  parameters: {
    docs: { description: { story: 'Keyboard focus uses a visible focus ring.' } },
  },
};

export const PrimaryDisabled: Story = {
  name: 'Primary / Disabled',
  args: {
    text: 'Save changes',
    disabled: true,
  },
};

export const SecondaryDefault: Story = {
  name: 'Secondary / Default',
  args: {
    text: 'Cancel',
    variant: 'secondary',
  },
};

export const SecondaryHover: Story = {
  name: 'Secondary / Hover',
  args: {
    text: 'Cancel',
    variant: 'secondary',
    state: 'hover',
  },
};

export const SecondaryFocused: Story = {
  name: 'Secondary / Focused',
  args: {
    text: 'Cancel',
    variant: 'secondary',
    state: 'focused',
  },
};

export const SecondaryDisabled: Story = {
  name: 'Secondary / Disabled',
  args: {
    text: 'Cancel',
    variant: 'secondary',
    disabled: true,
  },
};

export const DangerDefault: Story = {
  name: 'Danger / Default',
  args: {
    text: 'Delete project',
    styleType: 'danger',
  },
  parameters: {
    docs: {
      description: {
        story: 'Reserve danger buttons for destructive actions and pair them with explicit labels.',
      },
    },
  },
};

export const DangerHover: Story = {
  name: 'Danger / Hover',
  args: {
    text: 'Delete project',
    styleType: 'danger',
    state: 'hover',
  },
};

export const DangerFocused: Story = {
  name: 'Danger / Focused',
  args: {
    text: 'Delete project',
    styleType: 'danger',
    state: 'focused',
  },
};

export const DangerDisabled: Story = {
  name: 'Danger / Disabled',
  args: {
    text: 'Delete project',
    styleType: 'danger',
    disabled: true,
  },
};

export const GhostDefault: Story = {
  name: 'Ghost / Default',
  args: {
    text: 'Learn more',
    variant: 'ghost',
  },
};

export const GhostHover: Story = {
  name: 'Ghost / Hover',
  args: {
    text: 'Learn more',
    variant: 'ghost',
    state: 'hover',
  },
};

export const GhostFocused: Story = {
  name: 'Ghost / Focused',
  args: {
    text: 'Learn more',
    variant: 'ghost',
    state: 'focused',
  },
};

export const GhostDisabled: Story = {
  name: 'Ghost / Disabled',
  args: {
    text: 'Learn more',
    variant: 'ghost',
    disabled: true,
  },
};

export const AllVariants: Story = {
  name: 'Variants and icons',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Compares emphasis levels and supported icon placements. Ghost intentionally has no icon-only option.',
      },
    },
    layout: 'padded',
  },
  render: () => ({
    template: `<div class="button-comparison">${comparisonMarkup}</div>`,
    styles: [
      `
        .button-comparison { display: grid; gap: 32px; }
        .button-comparison__row { display: grid; gap: 12px; }
        .button-comparison__row h3 { margin: 0; font-size: 14px; font-weight: 600; }
        .button-comparison__examples { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
      `,
    ],
  }),
};

export const IconOnly: Story = {
  args: {
    text: '',
    iconType: 'icon-only',
    icon: 'plus',
    ariaLabel: 'Add item',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use only for universally understood actions and always provide an accessible label.',
      },
    },
  },
};

export const Sizes: Story = {
  parameters: {
    controls: { include: ['variant', 'styleType', 'iconType', 'icon'] },
    layout: 'padded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px;">
        <dds-button [variant]="variant" [styleType]="styleType" size="large" [iconType]="iconType" [icon]="icon">Large action</dds-button>
        <dds-button [variant]="variant" [styleType]="styleType" size="medium" [iconType]="iconType" [icon]="icon">Medium action</dds-button>
        <dds-button [variant]="variant" [styleType]="styleType" size="small" [iconType]="iconType" [icon]="icon">Small action</dds-button>
      </div>
    `,
  }),
};

export const FullWidth: Story = {
  args: {
    text: 'Continue',
    fullWidth: true,
    iconType: 'right-icon',
    icon: 'arrow-right',
  },
  parameters: {
    layout: 'padded',
    viewport: { defaultViewport: 'mobile' },
  },
};
