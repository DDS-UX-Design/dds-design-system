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
};

const meta: Meta<ButtonStoryArgs> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outlined', 'ghost'],
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'focused', 'disabled'],
    },
    styleType: {
      name: 'style',
      control: 'select',
      options: ['default', 'danger'],
    },
    size: {
      control: 'radio',
      options: ['large', 'medium', 'small'],
    },
    iconType: {
      control: 'select',
      options: ['no-icon', 'left-icon', 'right-icon', 'icon-only'],
    },
    icon: {
      control: 'select',
      options: DDS_ICON_NAMES,
    },
    ariaLabel: {
      control: 'text',
    },
    text: {
      control: 'text',
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
    icon: 'arrow-right',
  },
};

export const OutlinedWithRightIcon: Story = {
  args: {
    text: 'Outlined action',
    variant: 'outlined',
    iconType: 'right-icon',
    icon: 'info',
  },
};

export const GhostWithLeftIcon: Story = {
  args: {
    text: 'Sort by name',
    variant: 'ghost',
    iconType: 'left-icon',
    icon: 'arrow-up-down',
  },
};

export const GhostWithRightIcon: Story = {
  args: {
    text: 'Ghost action',
    variant: 'ghost',
    iconType: 'right-icon',
    icon: 'info',
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
    icon: 'arrow-up',
    ariaLabel: 'Add item',
    size: 'small',
  },
};
