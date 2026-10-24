import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ToggleComponent } from '../app/components/toggle/toggle.component';

type ToggleStoryArgs = ToggleComponent & { onCheckedChange: ReturnType<typeof fn> };
const meta: Meta<ToggleStoryArgs> = {
  title: 'Components/Forms/Toggle',
  component: ToggleComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An immediate binary setting. Keep the accessible label stable; use a checkbox for consent or a choice submitted with a form. Space toggles and Tab moves focus. Both sizes provide a minimum 44px interaction target. Use Toggle Field for a visible label and helper text. [Figma main component](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=1916-20208).',
      },
    },
  },
  args: {
    checked: false,
    disabled: false,
    size: 'large',
    state: 'default',
    ariaLabel: 'Order updates',
    onCheckedChange: fn(),
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'radio', options: ['large', 'small'] },
    state: {
      control: 'select',
      options: ['default', 'hover', 'focused', 'disabled'],
      description: 'Preview state. Native pointer hover and focus work independently.',
    },
    onCheckedChange: { action: 'checkedChange', table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `<dds-toggle [checked]="checked" [disabled]="disabled" [size]="size" [state]="state" [ariaLabel]="ariaLabel" (checkedChange)="checked = $event; onCheckedChange($event)" />`,
  }),
};
export default meta;
type Story = StoryObj<ToggleStoryArgs>;

export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const input = within(canvasElement).getByRole('switch', { name: 'Order updates' });
    input.focus();
    await userEvent.keyboard(' ');
    await expect(input).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard(' ');
    await expect(input).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};

const matrix = (theme: 'light' | 'dark') => ({
  template: `<section data-theme="${theme}" style="padding:32px;background:var(--color-bg-default);color:var(--color-text-primary)">
    ${(['large', 'small'] as const)
      .map(
        (size) => `<h2>${size}</h2><div style="display:flex;gap:24px;flex-wrap:wrap">
      ${(['default', 'hover', 'focused', 'disabled'] as const)
        .map(
          (state) => `<div style="display:grid;gap:8px"><span>${state}</span>
        <dds-toggle size="${size}" state="${state}" ariaLabel="${size} ${state} off" />
        <dds-toggle size="${size}" state="${state}" [checked]="true" ariaLabel="${size} ${state} on" />
      </div>`,
        )
        .join('')}
    </div>`,
      )
      .join('')}
  </section>`,
});

const verify: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  for (const size of ['large', 'small']) {
    const input = canvas.getByRole('switch', { name: `${size} default off` });
    const track = input.nextElementSibling!;
    await expect(track.getBoundingClientRect().width).toBe(size === 'large' ? 50 : 40);
    await expect(track.getBoundingClientRect().height).toBe(size === 'large' ? 26 : 20);
    await expect(input.getBoundingClientRect().height).toBe(44);
    await userEvent.hover(input);
    const probe = document.createElement('span');
    probe.style.color = 'var(--color-bg-subtle)';
    input.parentElement!.appendChild(probe);
    await expect(getComputedStyle(track).backgroundColor).toBe(getComputedStyle(probe).color);
    await userEvent.click(input);
    await expect(input).toBeChecked();
    probe.style.color = 'var(--color-border-focus)';
    await expect(getComputedStyle(track).boxShadow).toContain(getComputedStyle(probe).color);
    probe.remove();
    const disabled = canvas.getByRole('switch', { name: `${size} disabled on` });
    await expect(disabled).toBeDisabled();
    await userEvent.click(disabled);
    await expect(disabled).toBeChecked();
  }
};

export const Light: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => matrix('light'),
  play: verify,
};
export const Dark: Story = {
  parameters: Light.parameters,
  render: () => matrix('dark'),
  play: verify,
};
