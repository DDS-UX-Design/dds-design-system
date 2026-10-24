import {
  componentWrapperDecorator,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CollapsiblePanelComponent } from '../app/components/collapsible-panel/collapsible-panel.component';
import { TextInputComponent } from '../app/components/text-input/text-input.component';

type PanelStoryArgs = CollapsiblePanelComponent & {
  content: string;
  onOpenChange: ReturnType<typeof fn>;
};

const meta: Meta<PanelStoryArgs> = {
  title: 'Components/Layout/Collapsible Panel',
  component: CollapsiblePanelComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A disclosure for supporting details. The entire header toggles with click, Enter or Space; keyboard focus remains on the header. Project content into the body without adding another wrapper padding. Closed content stays mounted to preserve form values and leaves the tab order. Choose headingLevel for the surrounding page and supply a page-unique panelId when linking or server rendering. Grouped panels open independently; single-open behaviour belongs to the parent. Keep critical instructions, prices and blocking errors visible. No disabled/loading variants are defined. Focus styling is an implementation accessibility treatment. [Current Figma main components](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=1784-22).',
      },
    },
  },
  args: {
    title: 'Delivery and collection',
    content:
      'Collect from your selected store, or arrange delivery. Delivery fees are confirmed before checkout.',
    open: false,
    headingLevel: 3,
    onOpenChange: fn(),
  },
  argTypes: {
    open: { control: 'boolean' },
    headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] },
    onOpenChange: { action: 'openChange', table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `<dds-collapsible-panel [title]="title" [open]="open" [headingLevel]="headingLevel" (openChange)="open = $event; onOpenChange($event)">{{ content }}</dds-collapsible-panel>`,
  }),
};
export default meta;
type Story = StoryObj<PanelStoryArgs>;

export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const header = within(canvasElement).getByRole('button', { name: 'Delivery and collection' });
    const body = canvasElement.querySelector<HTMLElement>('.dds-collapsible-panel__body')!;
    await expect(header).toHaveAttribute('aria-controls', body.id);
    await expect(body).not.toBeVisible();
    header.focus();
    await userEvent.keyboard('{Enter}');
    await expect(header).toHaveFocus();
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(body).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard(' ');
    await expect(header).toHaveAttribute('aria-expanded', 'false');
    await expect(body).not.toBeVisible();
  },
};

const themedSections = (theme: 'light' | 'dark') => ({
  template: `<section data-theme="${theme}" style="padding:24px;background:var(--color-bg-subtle);color:var(--color-text-primary)">
    <div style="width:600px;max-width:100%;display:grid;gap:8px">
      <dds-collapsible-panel title="Product details" [open]="true">
        <div>ZestWave sparkling water · 355 ml can</div><div>SKU: ZW-355-LM · Category: Beverages</div>
      </dds-collapsible-panel>
      <dds-collapsible-panel title="Stock and availability">Nairobi CBD: 42 units. Westlands: 18 units.</dds-collapsible-panel>
      <dds-collapsible-panel title="Returns policy">Contact the store with your receipt to discuss an eligible return.</dds-collapsible-panel>
    </div>
  </section>`,
});

const verifySections: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const product = canvas.getByRole('button', { name: 'Product details' });
  const stock = canvas.getByRole('button', { name: 'Stock and availability' });
  const panel = stock.closest('.dds-collapsible-panel')!;
  await expect(stock.getBoundingClientRect().height).toBe(56);
  await expect(panel.getBoundingClientRect().height).toBe(58);
  await expect(panel.getBoundingClientRect().width).toBe(600);
  const icon = stock.querySelector('.dds-collapsible-panel__chevron')!;
  await expect(icon.getBoundingClientRect().width).toBe(20);
  await userEvent.click(stock);
  await expect(stock).toHaveAttribute('aria-expanded', 'true');
  await expect(product).toHaveAttribute('aria-expanded', 'true');
  const probe = document.createElement('span');
  panel.appendChild(probe);
  probe.style.color = 'var(--color-bg-elevated)';
  await expect(getComputedStyle(panel).backgroundColor).toBe(getComputedStyle(probe).color);
  probe.style.color = 'var(--color-icon-default)';
  await expect(getComputedStyle(icon).backgroundColor).toBe(getComputedStyle(probe).color);
  probe.remove();
};

export const Light: Story = { render: () => themedSections('light'), play: verifySections };
export const Dark: Story = { render: () => themedSections('dark'), play: verifySections };

export const NarrowLight: Story = {
  args: {
    title: 'Stock availability across your store locations',
    content:
      'Nairobi CBD: 42 units. Westlands: 18 units. Contact your selected store to confirm availability before collection.',
    open: true,
  },
  decorators: [
    componentWrapperDecorator(
      (story) =>
        `<div data-theme="light" style="width:360px;max-width:100%;background:var(--color-bg-subtle)">${story}</div>`,
    ),
  ],
};

export const NarrowDark: Story = {
  args: NarrowLight.args,
  decorators: [
    componentWrapperDecorator(
      (story) =>
        `<div data-theme="dark" style="width:360px;max-width:100%;background:var(--color-bg-subtle)">${story}</div>`,
    ),
  ],
};

export const PreservedFormValues: Story = {
  decorators: [moduleMetadata({ imports: [TextInputComponent] })],
  render: () => ({
    template: `<dds-collapsible-panel title="Delivery instructions" [open]="true"><dds-text-input label="Delivery note" helperText="Include access instructions for your driver." /></dds-collapsible-panel>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('button', { name: 'Delivery instructions' });
    const input = canvas.getByRole('textbox', { name: 'Delivery note' });
    await userEvent.type(input, 'Call reception on arrival.');
    await userEvent.click(header);
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
    await userEvent.click(header);
    await expect(canvas.getByRole('textbox', { name: 'Delivery note' })).toHaveValue(
      'Call reception on arrival.',
    );
  },
};
