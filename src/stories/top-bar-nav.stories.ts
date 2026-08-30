import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TopBarNavComponent } from '../app/components/top-bar-nav/top-bar-nav.component';

type TopBarNavStoryArgs = TopBarNavComponent & {
  onNotificationClick: ReturnType<typeof fn>;
  onCartClick: ReturnType<typeof fn>;
  onMenuItemSelect: ReturnType<typeof fn>;
};

const meta: Meta<TopBarNavStoryArgs> = {
  title: 'Components/Navigation/Top Bar Nav',
  component: TopBarNavComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="width: 100%; min-height: 180px">${story}</div>`,
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A responsive dashboard header with a page title, notification and cart counts, and an accessible account menu.',
      },
    },
  },
  args: {
    pageTitle: 'Dashboard',
    showNotifications: true,
    notificationCount: 27,
    showCart: true,
    cartCount: 2,
    userInitials: 'JB',
    userName: 'John Banda account',
    menuItems: ['Profile', 'Settings', 'Sign out'],
    menuOpen: false,
    onNotificationClick: fn(),
    onCartClick: fn(),
    onMenuItemSelect: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-top-bar-nav
        [pageTitle]="pageTitle"
        [showNotifications]="showNotifications"
        [notificationCount]="notificationCount"
        [showCart]="showCart"
        [cartCount]="cartCount"
        [userInitials]="userInitials"
        [userName]="userName"
        [menuItems]="menuItems"
        [(menuOpen)]="menuOpen"
        (notificationClick)="onNotificationClick()"
        (cartClick)="onCartClick()"
        (menuItemSelect)="onMenuItemSelect($event)"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<TopBarNavStoryArgs>;

export const Default: Story = {};
export const MenuOpen: Story = { args: { menuOpen: true } };
export const WithoutCart: Story = { args: { showCart: false } };
export const NoCounts: Story = { args: { notificationCount: 0, cartCount: 0 } };
export const LargeCounts: Story = { args: { notificationCount: 124, cartCount: 105 } };

export const AccountMenuInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'John Banda account' }));
    await expect(canvas.getByRole('menu')).toBeVisible();
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Profile' }));
    await expect(args.onMenuItemSelect).toHaveBeenCalledWith('Profile');
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};
