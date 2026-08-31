import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  CheckboxComponent,
  CheckboxState,
  CheckboxValue,
} from '../app/components/checkbox/checkbox.component';

type CheckboxStoryArgs = {
  label: string;
  option: string;
  value: CheckboxValue;
  state: CheckboxState;
  required: boolean;
  showLabel: boolean;
  showOption: boolean;
  ariaLabel: string;
  errorMessage: string;
  showErrorMessage: boolean;
  loading: boolean;
  onValueChange: ReturnType<typeof fn>;
};

const meta: Meta<CheckboxStoryArgs> = {
  title: 'Components/Forms/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A native checkbox for independent binary choices. It supports checked, unchecked, and mixed values plus deterministic focus, invalid, and disabled treatments for documentation.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Content' } },
    option: { control: 'text', table: { category: 'Content' } },
    value: {
      control: 'radio',
      options: ['unchecked', 'checked', 'indeterminate'],
      table: { category: 'State', defaultValue: { summary: 'unchecked' } },
    },
    state: {
      control: 'radio',
      options: ['default', 'focused', 'invalid', 'disabled'],
      table: { category: 'State', defaultValue: { summary: 'default' } },
    },
    required: { control: 'boolean', table: { category: 'Validation' } },
    showLabel: { control: 'boolean', table: { category: 'Content' } },
    showOption: { control: 'boolean', table: { category: 'Content' } },
    ariaLabel: {
      control: 'text',
      if: { arg: 'showOption', eq: false },
      table: { category: 'Accessibility' },
    },
    errorMessage: {
      control: 'text',
      if: { arg: 'state', eq: 'invalid' },
      table: { category: 'Validation' },
    },
    showErrorMessage: { control: 'boolean', table: { category: 'Validation' } },
    loading: { control: 'boolean', table: { category: 'State' } },
    onValueChange: { table: { disable: true } },
  },
  args: {
    label: 'Preferences',
    option: 'Send me product updates',
    value: 'unchecked',
    state: 'default',
    required: true,
    showLabel: true,
    showOption: true,
    ariaLabel: 'Send me product updates',
    errorMessage: 'Select this option to continue.',
    showErrorMessage: true,
    loading: false,
    onValueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-checkbox
        [label]="label"
        [option]="option"
        [value]="value"
        [state]="state"
        [required]="required"
        [showLabel]="showLabel"
        [showOption]="showOption"
        [ariaLabel]="ariaLabel"
        [errorMessage]="errorMessage"
        [showErrorMessage]="showErrorMessage"
        [loading]="loading"
        (valueChange)="value = $event; onValueChange($event)"
      ></dds-checkbox>
    `,
  }),
};

export default meta;
type Story = StoryObj<CheckboxStoryArgs>;

export const Playground: Story = {};
export const Checked: Story = { args: { value: 'checked' } };
export const Indeterminate: Story = { args: { value: 'indeterminate' } };
export const Focused: Story = { args: { value: 'checked', state: 'focused' } };
export const Invalid: Story = { args: { state: 'invalid' } };
export const Disabled: Story = { args: { value: 'checked', state: 'disabled' } };
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Loading checkbox')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.queryByRole('checkbox')).not.toBeInTheDocument();
  },
};
export const WithoutFieldLabel: Story = {
  name: 'Without field label',
  args: { showLabel: false, required: false },
};

export const Toggle: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: /send me product updates/i });

    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('checked');
  },
};
