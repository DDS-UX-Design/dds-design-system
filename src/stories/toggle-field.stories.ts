import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ToggleFieldComponent } from '../app/components/toggle-field/toggle-field.component';

type ToggleFieldStoryArgs = ToggleFieldComponent & { onCheckedChange: ReturnType<typeof fn> };
const meta: Meta<ToggleFieldStoryArgs> = {
  title: 'Components/Forms/Toggle Field',
  component: ToggleFieldComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A labelled immediate setting with a 50×44px control target. Clicking the label or helper text toggles once. Keep the label stable and explain unavailable settings in helper text. For asynchronous changes, disable repeat activation while saving and restore the previous value with an explanatory message on failure; no Loading/Error visual variants are defined. [Figma main component](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=1930-95).',
      },
    },
  },
  args: {
    label: 'Low-stock alerts',
    helperText: 'Get notified when stock runs low.',
    showHelperText: true,
    checked: false,
    disabled: false,
    onCheckedChange: fn(),
  },
  argTypes: { onCheckedChange: { action: 'checkedChange', table: { disable: true } } },
  render: (args) => ({
    props: args,
    template: `<dds-toggle-field [label]="label" [helperText]="helperText" [showHelperText]="showHelperText" [checked]="checked" [disabled]="disabled" (checkedChange)="checked = $event; onCheckedChange($event)" />`,
  }),
};
export default meta;
type Story = StoryObj<ToggleFieldStoryArgs>;

export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('switch', { name: 'Low-stock alerts' });
    await expect(input).toHaveAccessibleDescription('Get notified when stock runs low.');
    await userEvent.click(canvas.getByText('Low-stock alerts'));
    await expect(input).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByText('Get notified when stock runs low.'));
    await expect(input).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};

const settings = (theme: 'light' | 'dark') => ({
  template: `
  <section data-theme="${theme}" style="padding:24px;background:var(--color-bg-default);color:var(--color-text-primary);display:grid;gap:16px">
    <dds-toggle-field label="Low-stock alerts" helperText="Get notified when stock runs low." />
    <dds-toggle-field label="Order updates" helperText="Receive updates about your deliveries." [checked]="true" />
    <dds-toggle-field label="Weekly summary" helperText="Your administrator manages this setting." [disabled]="true" />
    <dds-toggle-field label="Security notifications" helperText="Required by your organisation." [checked]="true" [disabled]="true" />
  </section>`,
});

export const Light: Story = {
  render: () => settings('light'),
  parameters: { controls: { disable: true } },
};
export const Dark: Story = { render: () => settings('dark'), parameters: Light.parameters };
export const NarrowLongContent: Story = {
  args: {
    label: 'Inventory notifications for all regional distribution centres',
    helperText: 'Send an alert when any tracked product reaches its configured reorder threshold.',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="width:280px;max-width:100%">${story}</div>`),
  ],
};
