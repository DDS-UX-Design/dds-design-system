import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DropdownComponent, DropdownItem } from '../app/components/dropdown/dropdown.component';

const items: DropdownItem[] = [
  { label: 'Edit' },
  { label: 'Duplicate' },
  { label: 'Export', disabled: true },
  { label: 'Delete', styleType: 'danger' },
];
type Args = DropdownComponent & { onItemSelect: ReturnType<typeof fn> };
const meta: Meta<Args> = {
  title: 'Building Blocks/Actions/Dropdown',
  component: DropdownComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A short contextual action menu, opening down or up with automatic collision handling. Enter/Space or tap opens; arrows navigate enabled actions; Home/End jump; Escape restores trigger focus; Tab dismisses and continues. Use Select for form values. Keep labels short verbs, explain unavailable actions nearby and confirm irreversible actions in the application. Menus use the browser top layer to avoid table clipping and inherit the nearest data-theme. [Figma](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=152-3649).',
      },
    },
  },
  args: {
    items,
    triggerLabel: 'Actions',
    direction: 'down',
    align: 'start',
    iconOnly: false,
    disabled: false,
    open: false,
    onItemSelect: fn(),
  },
  argTypes: {
    direction: { control: 'radio', options: ['down', 'up'] },
    align: { control: 'radio', options: ['start', 'end'] },
    onItemSelect: { action: 'itemSelect', table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `<div style="min-height:440px;padding:32px;box-sizing:border-box">
    <dds-dropdown [items]="items" [triggerLabel]="triggerLabel" [direction]="direction" [align]="align" [iconOnly]="iconOnly" [disabled]="disabled" [(open)]="open" (itemSelect)="onItemSelect($event)" />
    <p style="max-width:248px">Export is unavailable until the report is ready.</p>
  </div>`,
  }),
};
export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    const remove = canvas.getByRole('menuitem', { name: 'Delete' });
    await expect(remove).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
    await expect(canvas.getByRole('menuitem', { name: 'Export' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Duplicate' }));
    await expect(args.onItemSelect).toHaveBeenLastCalledWith(items[1]);
    await expect(trigger).toHaveFocus();
  },
};

const comparison = (theme: 'light' | 'dark') => ({
  props: { items },
  template: `<section data-theme="${theme}" style="box-sizing:border-box;background:var(--color-bg-default);color:var(--color-text-primary);padding:32px;display:flex;flex-wrap:wrap;gap:48px;min-height:440px">
    <div style="width:248px;padding-bottom:200px"><h2>Dropdown</h2><dds-dropdown [items]="items" [open]="true" triggerLabel="Row actions" /><p>Export is not ready.</p></div>
    <div style="width:248px;padding-top:200px"><dds-dropdown [items]="items" [open]="true" direction="up" triggerLabel="More actions" /><h2>Dropup</h2></div>
  </section>`,
});
export const Light: Story = {
  render: () => comparison('light'),
  parameters: { layout: 'fullscreen' },
};
export const Dark: Story = {
  render: () => comparison('dark'),
  parameters: { layout: 'fullscreen' },
};

export const NarrowAndLongLabels: Story = {
  render: () => ({
    props: {
      items: [
        { label: 'Download the complete customer activity report for the last twelve months' },
        { label: 'Remove this saved report', styleType: 'danger' },
      ],
    },
    template: `<div style="width:260px;min-height:380px;padding:16px;box-sizing:border-box">
      <dds-dropdown [items]="items" [open]="true" triggerLabel="Report actions" />
    </div>`,
  }),
};
