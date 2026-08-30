import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RadioComponent, RadioState } from '../app/components/radio/radio.component';

type RadioStoryArgs = RadioComponent & { onSelected: ReturnType<typeof fn> };

const meta: Meta<RadioStoryArgs> = {
  title: 'Components/Forms/Radio',
  component: RadioComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A native radio control for one option within a mutually exclusive set. In product forms, prefer Radio Group so the shared label, validation, and selection state stay coordinated.',
      },
    },
  },
  args: {
    label: 'Delivery method',
    option: 'Standard delivery',
    value: 'standard',
    checked: false,
    state: 'default',
    required: true,
    showLabel: true,
    showOption: true,
    ariaLabel: 'Standard delivery',
    errorMessage: 'Select a delivery method.',
    showErrorMessage: true,
    onSelected: fn(),
  },
  argTypes: {
    state: {
      control: 'radio',
      options: ['default', 'focused', 'invalid', 'disabled'] satisfies RadioState[],
    },
    onSelected: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-radio
        [label]="label" [option]="option" [value]="value" [checked]="checked"
        [state]="state" [required]="required" [showLabel]="showLabel"
        [showOption]="showOption" [ariaLabel]="ariaLabel"
        [errorMessage]="errorMessage" [showErrorMessage]="showErrorMessage"
        (checkedChange)="checked = $event" (selected)="onSelected($event)"
      ></dds-radio>
    `,
  }),
};

export default meta;
type Story = StoryObj<RadioStoryArgs>;

export const Playground: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Focused: Story = { args: { checked: true, state: 'focused' } };
export const Invalid: Story = { args: { state: 'invalid' } };
export const Disabled: Story = { args: { checked: true, state: 'disabled' } };
export const WithoutFieldLabel: Story = { args: { showLabel: false, required: false } };

export const Select: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole('radio', { name: 'Standard delivery' });
    await userEvent.click(radio);
    await expect(radio).toBeChecked();
    await expect(args.onSelected).toHaveBeenCalledWith('standard');
  },
};
