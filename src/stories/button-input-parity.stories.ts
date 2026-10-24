import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { ButtonComponent } from '../app/components/button/button.component';
import { TextInputComponent } from '../app/components/text-input/text-input.component';

export default {
  title: 'Review/Button and Text Input Figma Parity',
  decorators: [moduleMetadata({ imports: [ButtonComponent, TextInputComponent] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Current Figma: Button 15:358 and Text Input 2:659. Review source geometry and real focus at the same theme. Pressed/loading Button designs remain undefined. This page is a comparison fixture, not a parity signoff.',
      },
    },
  },
} satisfies Meta;

const buttons = () =>
  (['large', 'medium', 'small'] as const)
    .map(
      (size) => `
<div data-size="${size}" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
  <dds-button size="${size}">Button Text</dds-button>
  <dds-button size="${size}" variant="secondary" iconType="right-icon" icon="info">Button Text</dds-button>
  <dds-button size="${size}" variant="ghost" state="focused">Button Text</dds-button>
  <dds-button size="${size}" styleType="danger">Delete item</dds-button>
  <dds-button size="${size}" [disabled]="true" state="focused">Unavailable</dds-button>
</div>`,
    )
    .join('');

const matrix = (theme: string, narrow = false) => `
<section data-theme="${theme}" style="padding:24px;background:var(--color-bg-default);color:var(--color-text-primary)">
<h2>Button and Text Input · ${theme}${narrow ? ' · 320px content' : ''}</h2>
<div style="display:grid;gap:24px;${narrow ? 'width:320px;max-width:100%;' : ''}">
${buttons()}
<dds-button variant="ghost" iconType="left-icon" icon="info" size="medium">View delivery details</dds-button>
<dds-text-input label="Label Text" value="Field text" [required]="true" helperText="Helper text" />
<dds-text-input label="Mobile label" value="Field text" size="mobile" [required]="true" helperText="Helper text" />
<dds-text-input label="Focused reference" value="Field text" state="focused" [required]="true" helperText="Helper text" />
<dds-text-input label="Invalid reference" value="Field text" state="error" errorMessage="Enter the reference from your invoice. If it is missing, contact the warehouse team before continuing." />
<dds-text-input label="Managed account" value="Field text" [disabled]="true" state="focused" [required]="true" helperText="This account is managed by your organisation." />
<dds-text-input label="Loading account" [loading]="true" />
<dds-button size="medium">Review delivery instructions before confirming dispatch</dds-button>
</div></section>`;

const verify = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  for (const section of canvasElement.querySelectorAll<HTMLElement>('section[data-theme]')) {
    const canvas = within(section);
    for (const [size, height, iconSize, fontSize] of [
      ['large', 48, 24, 16],
      ['medium', 40, 20, 14],
      ['small', 32, 16, 12],
    ] as const) {
      const row = section.querySelector<HTMLElement>(`[data-size="${size}"]`)!;
      const controls = row.querySelectorAll('button');
      for (const control of controls)
        await expect(control.getBoundingClientRect().height).toBe(height);
      const primary = controls[0];
      await expect(getComputedStyle(primary).fontSize).toBe(`${fontSize}px`);
      const textWidth = primary.querySelector('span')!.getBoundingClientRect().width;
      const horizontalPadding = size === 'large' ? 48 : size === 'medium' ? 32 : 24;
      await expect(primary.getBoundingClientRect().width).toBeCloseTo(
        textWidth + horizontalPadding,
        0,
      );
      const icon = controls[1].querySelector('svg')!;
      await expect(icon.getBoundingClientRect().width).toBe(iconSize);
      await expect(getComputedStyle(controls[2]).borderTopWidth).toBe('2px');
      await expect(controls[4]).toBeDisabled();
    }
    const mobile = canvas.getByRole('textbox', { name: 'Mobile label' });
    await expect(mobile.parentElement!.getBoundingClientRect().height).toBe(40);
    const marker = mobile.closest('.dds-text-input')!.querySelector('.dds-text-input__required')!;
    await expect(getComputedStyle(marker).fontSize).toBe('14px');
    await expect(getComputedStyle(marker).lineHeight).toBe('20px');
    const error = canvas.getByRole('textbox', { name: 'Invalid reference' });
    await userEvent.click(error);
    await expect(error).toHaveFocus();
    await expect(error).toHaveAttribute('aria-invalid', 'true');
    await expect(error).toHaveAccessibleDescription(/Enter the reference from your invoice/);
    const disabled = canvas.getByRole('textbox', { name: 'Managed account' });
    await expect(disabled).toBeDisabled();
    await expect(canvas.getByLabelText('Loading text input')).toHaveAttribute('aria-busy', 'true');
  }
};

type Story = StoryObj;
export const Light: Story = { render: () => ({ template: matrix('light') }), play: verify };
export const Dark: Story = { render: () => ({ template: matrix('dark') }), play: verify };
export const NarrowLight: Story = {
  render: () => ({ template: matrix('light', true) }),
  play: verify,
};
export const NarrowDark: Story = {
  render: () => ({ template: matrix('dark', true) }),
  play: verify,
};
