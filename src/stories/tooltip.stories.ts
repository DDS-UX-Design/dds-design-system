import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { ButtonComponent } from '../app/components/button/button.component';
import { TooltipComponent } from '../app/components/tooltip/tooltip.component';
import { TooltipDirective } from '../app/components/tooltip/tooltip.directive';

const meta: Meta<TooltipComponent> = {
  title: 'Building Blocks/Feedback/Tooltip',
  component: TooltipComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [TooltipDirective, ButtonComponent] })],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Use the standalone TooltipDirective on one focusable control: `<dds-button [ddsTooltip]="help">Export report</dds-button>`. It describes the native button without changing its accessible name. Hover or focus opens supplementary, non-interactive text; Escape dismisses without moving focus. The pointer can move onto the bubble. Placements flip and shift at viewport edges, preserving the arrow gap. Themes inherit from the nearest data-theme scope. The visual TooltipComponent below demonstrates appearance; the directive supplies interaction and positioning. Keep essential instructions visible, do not put actions in tooltips, and use a labelled help popover for tap-only help. Do not repeat the trigger name verbatim. Native disabled controls do not show a tooltip; explain unavailable controls nearby. [Figma specifications](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=1775-35).',
      },
    },
  },
  args: {
    text: 'Download this report as a CSV file.',
    placement: 'top',
    content: 'short',
    showArrow: true,
  },
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    content: { control: 'radio', options: ['short', 'multiline'] },
    showArrow: { control: 'boolean' },
    tooltipId: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `<div style="padding:80px"><dds-button [ddsTooltip]="text" [tooltipPlacement]="placement" [tooltipContent]="content" [tooltipShowArrow]="showArrow" variant="secondary" size="medium">Export report</dds-button></div>`,
  }),
};
export default meta;
type Story = StoryObj<TooltipComponent>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const button = canvas.getByRole('button', { name: 'Export report' });
    await userEvent.hover(button);
    const bubble = await page.findByRole('tooltip');
    await expect(button).toHaveAccessibleName('Export report');
    await expect(button).toHaveAccessibleDescription('Download this report as a CSV file.');
    await userEvent.hover(bubble);
    await expect(bubble).toBeVisible();
    await userEvent.unhover(bubble);
    await waitFor(() => expect(page.queryByRole('tooltip')).not.toBeInTheDocument());
    button.focus();
    await expect(await page.findByRole('tooltip')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(page.queryByRole('tooltip')).not.toBeInTheDocument();
    await expect(button).toHaveFocus();
  },
};

function variants(theme: 'light' | 'dark') {
  return {
    template: `<section data-theme="${theme}" style="padding:32px;background:var(--color-bg-default);color:var(--color-text-primary);display:grid;gap:32px;grid-template-columns:repeat(2,minmax(300px,1fr))">
    ${(['top', 'bottom', 'left', 'right'] as const)
      .flatMap((placement) =>
        (['short', 'multiline'] as const).map((content) => {
          const id = `tooltip-${theme}-${placement}-${content}`;
          const vertical = placement === 'top' || placement === 'bottom';
          const reverse = placement === 'bottom' || placement === 'right';
          return `<div><p>${placement} · ${content}</p><div style="display:flex;align-items:center;justify-content:center;gap:4px;flex-direction:${vertical ? 'column' : 'row'}${reverse ? '-reverse' : ''};min-height:100px">
        <dds-tooltip tooltipId="${id}" text="${content === 'short' ? 'View product details' : 'Available stock excludes reserved and damaged units.'}" placement="${placement}" content="${content}" />
        <button type="button" aria-label="Stock calculation help" aria-describedby="${id}" style="min-width:44px;min-height:44px;border:1px solid var(--color-border-default);background:var(--color-bg-elevated);color:var(--color-text-primary)">?</button>
      </div></div>`;
        }),
      )
      .join('')}
  </section>`,
  };
}

const verifyAppearance: NonNullable<Story['play']> = async ({ canvasElement }) => {
  for (const bubble of within(canvasElement).getAllByRole('tooltip')) {
    const surface = bubble.querySelector('.dds-tooltip__surface')!;
    const style = getComputedStyle(surface);
    await expect(style.fontSize).toBe('14px');
    await expect(style.lineHeight).toBe('20px');
    await expect(style.paddingTop).toBe('8px');
    await expect(style.paddingLeft).toBe('12px');
    const arrow = bubble.querySelector('.dds-tooltip__arrow')!;
    const horizontal = ['left', 'right'].includes(bubble.getAttribute('data-placement')!);
    await expect(arrow.getBoundingClientRect().width).toBe(horizontal ? 6 : 12);
    await expect(arrow.getBoundingClientRect().height).toBe(horizontal ? 12 : 6);
    const probe = document.createElement('span');
    bubble.appendChild(probe);
    probe.style.color = 'var(--color-bg-inverse)';
    await expect(style.backgroundColor).toBe(getComputedStyle(probe).color);
    await expect(getComputedStyle(arrow).backgroundColor).toBe(getComputedStyle(probe).color);
    probe.style.color = 'var(--color-text-inverse)';
    await expect(style.color).toBe(getComputedStyle(probe).color);
    probe.remove();
  }
};

export const Light: Story = {
  render: () => variants('light'),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  play: verifyAppearance,
};
export const Dark: Story = {
  render: () => variants('dark'),
  parameters: Light.parameters,
  play: verifyAppearance,
};

export const WithoutArrow: Story = { args: { showArrow: false, content: 'multiline' } };

export const ViewportEdges: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => ({
    template: `<section data-theme="light" style="min-height:300px;padding:4px;background:var(--color-bg-default);color:var(--color-text-primary)">
    <dds-button ddsTooltip="Reserved units are excluded from this total." tooltipContent="multiline" tooltipPlacement="top" variant="secondary" size="medium">Available stock</dds-button>
    <p>Hover or focus the control near the top-left edge. The bubble flips below it and shifts into view.</p>
  </section>`,
  }),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Available stock' });
    button.focus();
    const bubble = await within(canvasElement.ownerDocument.body).findByRole('tooltip');
    await expect(bubble).toHaveAttribute('data-placement', 'bottom');
    const rect = bubble.getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(8);
    await expect(rect.right).toBeLessThanOrEqual(
      canvasElement.ownerDocument.defaultView!.innerWidth - 8,
    );
  },
};

export const NarrowDark: Story = {
  args: {
    text: 'Stock is updated after completed receipts and excludes units reserved for other orders.',
    content: 'multiline',
  },
  render: (args) => ({
    props: args,
    template: `<section data-theme="dark" style="width:280px;max-width:100%;padding:48px 8px;background:var(--color-bg-default);color:var(--color-text-primary)"><dds-button [ddsTooltip]="text" tooltipContent="multiline" tooltipPlacement="right" variant="secondary" size="medium">Stock calculation</dds-button><p>Keep required stock instructions visible for touch users.</p></section>`,
  }),
};
