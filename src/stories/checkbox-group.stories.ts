import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  CheckboxGroupComponent,
  CheckboxGroupDirection,
  CheckboxGroupOption,
  CheckboxGroupState,
} from '../app/components/checkbox-group/checkbox-group.component';

type CheckboxGroupStoryArgs = CheckboxGroupComponent & {
  onSelectedValuesChange: ReturnType<typeof fn>;
};

const notificationOptions: CheckboxGroupOption[] = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Push', value: 'push' },
  { label: 'Phone', value: 'phone' },
];

const meta: Meta<CheckboxGroupStoryArgs> = {
  title: 'Components/Forms/Checkbox Group',
  component: CheckboxGroupComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A labelled collection of independent checkbox options. It supports inline and stacked layouts, group-level validation and helper text, disabled options, and two-way selected-values binding.',
      },
    },
  },
  args: {
    label: 'Notification channels',
    options: notificationOptions,
    selectedValues: ['email'],
    direction: 'inline',
    state: 'default',
    required: true,
    showLabel: true,
    helperText: 'Select all channels that apply.',
    showHelperText: false,
    errorMessage: 'Select at least one notification channel.',
    loading: false,
    onSelectedValuesChange: fn(),
  },
  argTypes: {
    direction: {
      control: 'radio',
      options: ['inline', 'stacked'] satisfies CheckboxGroupDirection[],
    },
    state: {
      control: 'radio',
      options: ['default', 'invalid', 'disabled'] satisfies CheckboxGroupState[],
    },
    loading: { control: 'boolean', table: { category: 'State' } },
    onSelectedValuesChange: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-checkbox-group
        [label]="label" [options]="options" [selectedValues]="selectedValues"
        [direction]="direction" [state]="state" [required]="required"
        [showLabel]="showLabel" [helperText]="helperText"
        [showHelperText]="showHelperText" [errorMessage]="errorMessage"
        [loading]="loading"
        (selectedValuesChange)="selectedValues = $event; onSelectedValuesChange($event)"
      ></dds-checkbox-group>
    `,
  }),
};

export default meta;
type Story = StoryObj<CheckboxGroupStoryArgs>;

export const Inline: Story = {};
export const Stacked: Story = { args: { direction: 'stacked' } };
export const WithHelperText: Story = { args: { showHelperText: true } };
export const Invalid: Story = { args: { state: 'invalid', selectedValues: [] } };
export const Disabled: Story = { args: { state: 'disabled' } };
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Loading checkbox group')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await expect(canvas.queryByRole('checkbox')).not.toBeInTheDocument();
  },
};
export const WithDisabledOption: Story = {
  args: {
    direction: 'stacked',
    options: notificationOptions.map((option) =>
      option.value === 'phone' ? { ...option, disabled: true } : option,
    ),
  },
};

export const ToggleOptions: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const sms = canvas.getByRole('checkbox', { name: 'SMS' });

    await userEvent.click(sms);
    await expect(sms).toBeChecked();
    await expect(args.onSelectedValuesChange).toHaveBeenLastCalledWith(['email', 'sms']);
  },
};
