import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import {
  SidebarNavComponent,
  type SidebarNavItem,
} from '../app/components/sidebar-nav/sidebar-nav.component';

export default {
  title: 'Components/Navigation/Sidebar Nav/Figma Parity',
  decorators: [moduleMetadata({ imports: [SidebarNavComponent] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Current main set 1805:409 and Light/Dark frames 2112:581 / 2112:742. Fixed 790px source height; 250px expanded and 72px collapsed. Hover and focus below are actual interactions, not component preview inputs.',
      },
    },
  },
} satisfies Meta;

const topItems: SidebarNavItem[] = [
  { id: 'first', label: 'Parent', icon: 'info', href: '#first' },
  {
    id: 'second',
    label: 'Parent',
    icon: 'info',
    children: [{ id: 'second-child', label: 'Child', href: '#second-child' }],
  },
  {
    id: 'active',
    label: 'Parent (Active)',
    icon: 'info',
    children: Array.from({ length: 7 }, (_, index) => ({
      id: `child-${index}`,
      label: index === 0 ? 'Child (Active)' : index === 3 ? 'Child (Hover)' : 'Child',
      href: `#child-${index}`,
    })),
  },
  {
    id: 'hover',
    label: 'Parent (Hover)',
    icon: 'info',
    children: [{ id: 'hover-child', label: 'Child', href: '#hover-child' }],
  },
];
const bottomItems: SidebarNavItem[] = [
  { id: 'bottom-first', label: 'Parent', icon: 'info', href: '#bottom-first' },
  { id: 'bottom-second', label: 'Parent', icon: 'info', href: '#bottom-second' },
];
const render =
  (theme: string, initialCollapsed = false, longContent = false) =>
  () => ({
    props: {
      topItems: longContent
        ? [
            ...topItems,
            {
              id: 'long',
              label: 'Warehouse configuration and distribution preferences for regional operations',
              icon: 'settings',
            },
          ]
        : topItems,
      bottomItems,
      collapsed: initialCollapsed,
      activeItemId: 'child-0',
      expandedIds: ['active'],
    },
    template: `
<section data-theme="${theme}" style="padding:32px;background:var(--color-bg-default);color:var(--color-text-primary)">
<h2>Sidebar Nav · ${theme}</h2>
<div style="height:790px;width:fit-content;max-width:100%">
<dds-sidebar-nav [items]="topItems" [bottomItems]="bottomItems" [(collapsed)]="collapsed" [(activeItemId)]="activeItemId" [(expandedIds)]="expandedIds" (click)="$event.preventDefault()" />
</div></section>`,
  });

async function role(element: Element, property: string, token: string) {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  element.appendChild(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  await expect(getComputedStyle(element).getPropertyValue(property)).toBe(colour);
}

const verifyExpanded = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const host = canvasElement.querySelector('dds-sidebar-nav')!;
  const aside = host.querySelector('aside')!;
  await expect(host.getBoundingClientRect().width).toBe(250);
  await expect(aside.getBoundingClientRect().height).toBe(790);
  await expect(host.querySelector('header')!.getBoundingClientRect().height).toBe(65);
  await expect(host.querySelector('footer')!.getBoundingClientRect().height).toBe(65);
  await role(aside, 'background-color', '--color-bg-elevated');
  await role(aside, 'color', '--color-text-primary');
  const active = canvas.getByRole('button', { name: 'Parent (Active)' });
  await role(active, 'background-color', '--color-feedback-info-subtle');
  await role(active.querySelector('dds-icon')!, 'color', '--color-icon-default');
  await expect(active.getBoundingClientRect().height).toBe(48);
  await expect(active.querySelector('svg')!.getBoundingClientRect().width).toBe(20);
  const first = host.querySelector('.dds-sidebar-nav__parent')!;
  await expect(first.getBoundingClientRect().top - aside.getBoundingClientRect().top).toBe(85);
  const child = canvas.getByRole('link', { name: 'Child (Active)' });
  await expect(child.getBoundingClientRect().height).toBe(36);
  await expect(child).toHaveAttribute('aria-current', 'page');
  await role(child, 'color', '--color-interactive-default');
  const hover = canvas.getByRole('button', { name: 'Parent (Hover)' });
  await userEvent.hover(hover);
  await role(hover, 'background-color', '--color-feedback-info-subtle');
  const image: HTMLImageElement = host.querySelector('img')!;
  await expect(image.getBoundingClientRect().width).toBe(23);
  await expect(image.getBoundingClientRect().height).toBe(24);
  await expect(image.complete && image.naturalWidth > 0).toBe(true);
  await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
  await expect(host.getBoundingClientRect().width).toBe(72);
  await expect(canvas.queryByRole('link', { name: 'Child (Active)' })).not.toBeInTheDocument();
  await userEvent.hover(canvas.getByRole('button', { name: 'Parent (Active)' }));
  await expect(canvas.getByRole('tooltip')).toHaveTextContent('Parent (Active)');
  await userEvent.keyboard('{Escape}');
  await expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument();
  // Explicit focus/keyboard activation also works without pointer interaction.
  const toggle = canvas.getByRole('button', { name: 'Expand sidebar' });
  toggle.focus();
  await userEvent.keyboard('{Enter}');
  await expect(host.getBoundingClientRect().width).toBe(250);
  await expect(canvas.getByRole('link', { name: 'Child (Active)' })).toHaveAttribute(
    'aria-current',
    'page',
  );
};

type Story = StoryObj;
export const Light: Story = { render: render('light') };
export const Dark: Story = { render: render('dark') };
export const CollapsedLight: Story = { render: render('light', true) };
export const CollapsedDark: Story = { render: render('dark', true) };
export const LightInteractions: Story = { render: render('light'), play: verifyExpanded };
export const DarkInteractions: Story = { render: render('dark'), play: verifyExpanded };
export const LongContent: Story = { render: render('light', false, true) };
