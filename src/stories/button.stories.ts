import type { Meta, StoryObj } from '@storybook/angular';
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
          'A reusable button component for primary actions, supporting variants, sizes, icon placement, disabled states, and destructive styling.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outlined', 'ghost'],
      description: 'Visual treatment that signals the button’s importance and purpose.',
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'focused', 'disabled'],
      description: 'Optional visual state for previewing interaction states.',
    },
    styleType: {
      name: 'style',
      control: 'select',
      options: ['default', 'danger'],
      description: 'Semantic style that can switch the button to a destructive treatment.',
    },
    size: {
      control: 'radio',
      options: ['large', 'medium', 'small'],
      description: 'Control the height and padding to fit different layouts.',
    },
    iconType: {
      control: 'select',
      options: ['no-icon', 'left-icon', 'right-icon', 'icon-only'],
      description: 'Determines whether an icon appears before, after, or instead of the label.',
    },
    icon: {
      control: 'select',
      options: DDS_ICON_NAMES,
      description: 'Icon to render when the button uses an icon placement option.',
    },
    ariaLabel: {
      control: 'text',
      description:
        'Accessible label required for icon-only buttons when no visible text is present.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button and applies the disabled visual treatment.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Expands the button to fill the available width of its container.',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Native button type used for forms and semantic button behavior.',
    },
    text: {
      control: 'text',
      description: 'Visible label displayed inside the button.',
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

export const Primary: Story = {
  args: {
    text: 'Primary action',
    variant: 'primary',
  },
};

export const Outlined: Story = {
  args: {
    text: 'Outlined action',
    variant: 'outlined',
  },
};

export const Ghost: Story = {
  args: {
    text: 'Ghost action',
    variant: 'ghost',
  },
};

export const PrimaryWithLeftIcon: Story = {
  args: {
    text: 'Primary action',
    variant: 'primary',
    iconType: 'left-icon',
    icon: 'info',
  },
};

export const PrimaryWithRightIcon: Story = {
  args: {
    text: 'Primary action',
    variant: 'primary',
    iconType: 'right-icon',
    icon: 'info',
  },
};

export const OutlinedWithLeftIcon: Story = {
  args: {
    text: 'Outlined action',
    variant: 'outlined',
    iconType: 'left-icon',
    icon: 'info',
  },
};

export const OutlinedWithRightIcon: Story = {
  args: {
    text: 'Outlined action',
    variant: 'outlined',
    iconType: 'right-icon',
    icon: 'arrow-right',
  },
};

export const GhostWithLeftIcon: Story = {
  args: {
    text: 'Sort by name',
    variant: 'ghost',
    iconType: 'left-icon',
    icon: 'info',
  },
};

export const GhostWithRightIcon: Story = {
  args: {
    text: 'Ghost action',
    variant: 'ghost',
    iconType: 'right-icon',
    icon: 'chevron-down',
  },
};

export const Disabled: Story = {
  args: {
    text: 'Disabled action',
    state: 'disabled',
  },
};

export const Danger: Story = {
  args: {
    text: 'Delete',
    styleType: 'danger',
  },
};

export const IconOnly: Story = {
  args: {
    text: '',
    iconType: 'icon-only',
    icon: 'info',
    ariaLabel: 'Add item',
    size: 'large',
  },
};
