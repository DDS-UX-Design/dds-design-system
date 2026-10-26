import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  RadioGroupComponent,
  RadioGroupDirection,
  RadioGroupState,
  RadioOption,
} from '../app/components/radio-group/radio-group.component';

type RadioGroupStoryArgs = RadioGroupComponent & {
  onSelectedValueChange: ReturnType<typeof fn>;
};

const deliveryOptions: RadioOption[] = [
  { label: 'Standard', value: 'standard' },
  { label: 'Express', value: 'express' },
  { label: 'Same day', value: 'same-day' },
  { label: 'Collection', value: 'collection' },
];

const meta: Meta<RadioGroupStoryArgs> = {
  title: 'Compositions/Forms/Radio Group',
  component: RadioGroupComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A native, labelled group of mutually exclusive radio options. It supports inline and stacked layouts, required validation, disabled options, and two-way selected-value binding.',
      },
    },
  },
  args: {
    label: 'Delivery method',
    options: deliveryOptions,
    selectedValue: 'standard',
    direction: 'inline',
    state: 'default',
    required: true,
    showLabel: true,
    errorMessage: 'Select a delivery method.',
    loading: false,
    onSelectedValueChange: fn(),
  },
  argTypes: {
    direction: {
      control: 'radio',
      options: ['inline', 'stacked'] satisfies RadioGroupDirection[],
    },
    state: {
      control: 'radio',
      options: ['default', 'invalid', 'disabled'] satisfies RadioGroupState[],
    },
    loading: { control: 'boolean', table: { category: 'State' } },
    onSelectedValueChange: { action: 'selectedValueChange', table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-radio-group
        [label]="label" [options]="options" [selectedValue]="selectedValue"
        [direction]="direction" [state]="state" [required]="required"
        [showLabel]="showLabel" [errorMessage]="errorMessage"
        [loading]="loading"
        (selectedValueChange)="selectedValue = $event; onSelectedValueChange($event)"
      ></dds-radio-group>
    `,
  }),
};

export default meta;
type Story = StoryObj<RadioGroupStoryArgs>;

export const Inline: Story = {};
export const Stacked: Story = { args: { direction: 'stacked' } };
export const Invalid: Story = { args: { state: 'invalid', selectedValue: '' } };
export const Disabled: Story = { args: { state: 'disabled' } };
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Loading radio group')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
  },
};
export const WithDisabledOption: Story = {
  args: {
    direction: 'stacked',
    options: deliveryOptions.map((option) =>
      option.value === 'same-day' ? { ...option, disabled: true } : option,
    ),
  },
};

export const ChangeSelection: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const express = canvas.getByRole('radio', { name: 'Express' });
    await userEvent.click(express);
    await expect(express).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Standard' })).not.toBeChecked();
    await expect(args.onSelectedValueChange).toHaveBeenCalledWith('express');
  },
};
