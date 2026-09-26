import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NavTabComponent, NavTabItem } from '../app/components/nav-tab/nav-tab.component';

const items: NavTabItem[] = [
  { value: 'overview', label: 'Tab 1', icon: 'info' },
  { value: 'details', label: 'Tab 2', icon: 'info' },
  { value: 'activity', label: 'Tab 3', icon: 'info' },
  { value: 'disabled', label: 'Disabled Tab', icon: 'info', disabled: true },
  { value: 'settings', label: 'Tab 5', icon: 'info' },
];

const meta: Meta<NavTabComponent> = {
  title: 'Components/Navigation/Nav Tab',
  component: NavTabComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    // Internal onKeydown/onFocus handlers must not become inferred action callbacks.
    actions: { argTypesRegex: '^$' },
    docs: {
      description: {
        component:
          'Tabs switch between related content panels. Matches the desktop, mobile, and vertical variants in [Figma](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL/DDS---Design-System-v1.0?node-id=107-5975). Supply unique item values and a stable group id. Set each item’s panelId to its consumer-rendered role="tabpanel" element, label that panel with tabId(value), and hide inactive panels. Read activeValue for the effective selection when the requested value is unavailable. Manual activation uses Arrow keys/Home/End to focus and Enter/Space to select; automatic activation selects on arrow navigation. Disabled tabs are skipped. Size is explicit; overflowing horizontal groups scroll. Use links for route navigation. Focus styling, activation, and overflow behavior are implementation defaults pending design review.',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['desktop', 'mobile'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    activation: { control: 'inline-radio', options: ['manual', 'automatic'] },
    selectedValueChange: { action: 'selectedValueChange', table: { disable: true } },
  },
  args: {
    items,
    selectedValue: 'overview',
    size: 'desktop',
    orientation: 'horizontal',
    activation: 'manual',
    ariaLabel: 'Example tabs',
    selectedValueChange: fn(),
  },
};
export default meta;
type Story = StoryObj<NavTabComponent>;

export const Playground: Story = {};
export const WithoutIcons: Story = {
  args: { items: items.map(({ icon, ...item }) => item) },
};
export const Mobile: Story = {
  args: { size: 'mobile', selectedValue: 'details' },
};
export const MobileWithoutIcons: Story = {
  args: { ...WithoutIcons.args, size: 'mobile' },
};
export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    items: items.map((item, index) => ({ ...item, label: `Tab ${index + 1}`, disabled: false })),
  },
};

export const Overflow: Story = {
  args: { size: 'mobile' },
  render: (args) => ({
    props: args,
    template: `<div style="width:320px;max-width:100%"><dds-nav-tab [items]="items" [size]="size" [selectedValue]="selectedValue" /></div>`,
  }),
};
export const WithPanels: Story = {
  args: {
    items: items.map((item) => ({ ...item, panelId: `nav-demo-panel-${item.value}` })),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-nav-tab #tabs id="nav-demo" [items]="items" [selectedValue]="selectedValue"
        [size]="size" [orientation]="orientation" [activation]="activation" [ariaLabel]="ariaLabel"
        (selectedValueChange)="selectedValue = $event; selectedValueChange($event)" />
      @for (item of items; track item.value) {
        <section role="tabpanel" [id]="item.panelId" [attr.aria-labelledby]="tabs.tabId(item.value)"
          [hidden]="tabs.activeValue !== item.value" tabindex="0" style="padding:24px">
          <h2>{{ item.label }} Content</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.</p>
        </section>
      }
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    await userEvent.click(tabs[0]);
    await userEvent.keyboard('{ArrowRight}');
    await expect(tabs[1]).toHaveFocus();
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    await expect(args.selectedValueChange).toHaveBeenCalledWith('details');
    await expect(canvas.getByRole('tabpanel', { name: 'Tab 2' })).toHaveTextContent(
      'Tab 2 Content',
    );
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(tabs[4]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(tabs[0]).toHaveFocus();
  },
};
