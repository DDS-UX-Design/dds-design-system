import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ModalComponent } from '../app/components/modal/modal.component';
import { ButtonComponent } from '../app/components/button/button.component';
import { ModalRequestExampleComponent } from './modal-request.example';

const meta: Meta<ModalComponent> = {
  title: 'Compositions/Feedback/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A blocking decision or short task, composed with DDS Buttons. Bind [(open)] and handle (confirmed): the modal does not perform requests or close on confirmation. Set state="submitting" synchronously before starting a request; this disables actions, dismissal and projected controls. Restore default/error on a bounded failure or timeout, and close only after success. Reconcile uncertain server outcomes before retrying. Error state preserves projected content. Native dialog supplies the top layer and inert background; Tab is contained and focus returns to the invoker. Destructive dialogs initially focus the secondary action. Backdrop dismissal is off by default, always blocked for destructive intent, and must remain off for forms. Themes inherit from the nearest data-theme ancestor. At viewports below 600px, the 328px mobile shell uses stacked 48px actions; otherwise the shell is 560px. Both retain at least 16px viewport margins and scroll the body. Do not nest modals or use projected forms with method="dialog". [Current Figma component](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=1938-297).',
      },
    },
  },
  args: {
    open: false,
    title: 'Confirm order?',
    message: 'Confirm this order to begin fulfilment.',
    primaryLabel: 'Confirm order',
    secondaryLabel: 'Keep editing',
    intent: 'standard',
    state: 'default',
    showContent: true,
    closeOnBackdrop: false,
    submittingLabel: 'Saving…',
    submittingMessage: 'Saving… Keep this window open.',
    errorMessage: 'The action could not be completed. Your changes are preserved. Try again.',
  },
  argTypes: {
    intent: { control: 'radio', options: ['standard', 'destructive'] },
    state: {
      control: 'radio',
      options: ['default', 'submitting', 'error'],
      description:
        'Controlled by application request logic. Submitting in Controls is a visual preview; switch to Default or Error to recover.',
    },
    confirmed: { control: false },
    cancelled: { control: false },
    openChange: { control: false },
  },
};
export default meta;
type Story = StoryObj<ModalComponent>;

const render = (
  args: Record<string, unknown>,
  theme: 'light' | 'dark' = 'light',
  long = false,
) => ({
  props: args,
  template: `<section data-theme="${theme}" style="min-height:240px;padding:24px;background:var(--color-bg-default);color:var(--color-text-primary)">
    <dds-button (click)="open = true">Open dialog</dds-button>
    <dds-modal [(open)]="open" [title]="title" [message]="message" [intent]="intent" [state]="state" [primaryLabel]="primaryLabel" [secondaryLabel]="secondaryLabel" [showContent]="showContent" [closeOnBackdrop]="closeOnBackdrop" [submittingLabel]="submittingLabel" [submittingMessage]="submittingMessage" [errorMessage]="errorMessage">
      ${long ? Array.from({ length: 12 }, (_, i) => `<p>Delivery ${i + 1}: Nairobi distribution centre. Confirm the receiving contact and delivery instructions before dispatching this order.</p>`).join('') : '<div>Order #ORD-1048 · Nairobi warehouse · KES 42,800</div>'}
    </dds-modal>
  </section>`,
});

export const Playground: Story = { render: (args) => render(args) };

const verify: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: 'Open dialog' });
  await userEvent.click(trigger);
  const dialog = canvas.getByRole('dialog', { name: 'Confirm order?' });
  await expect(dialog).toHaveAccessibleDescription('Confirm this order to begin fulfilment.');
  const expectedWidth = Math.min(window.innerWidth < 600 ? 328 : 560, window.innerWidth - 32);
  await expect(dialog.getBoundingClientRect().width).toBe(expectedWidth);
  const close = within(dialog).getByRole('button', { name: 'Close dialog' });
  await expect(close.getBoundingClientRect().width).toBe(44);
  await expect(close.querySelector('span')!.getBoundingClientRect().width).toBe(24);
  const probe = document.createElement('span');
  dialog.appendChild(probe);
  try {
    probe.style.color = 'var(--color-bg-elevated)';
    await expect(getComputedStyle(dialog).backgroundColor).toBe(getComputedStyle(probe).color);
    probe.style.color = 'var(--color-icon-default)';
    await expect(getComputedStyle(close).color).toBe(getComputedStyle(probe).color);
  } finally {
    probe.remove();
  }
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(dialog).not.toBeVisible());
  await expect(trigger).toHaveFocus();
};
export const Light: Story = { render: (args) => render(args, 'light'), play: verify };
export const Dark: Story = { render: (args) => render(args, 'dark'), play: verify };

export const Destructive: Story = {
  args: {
    title: 'Delete this item?',
    message:
      'This permanently deletes an unused catalog item. Check dependencies before continuing.',
    primaryLabel: 'Delete item',
    secondaryLabel: 'Keep item',
    intent: 'destructive',
    showContent: false,
  },
  render: (args) => render(args),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    const dialog = canvas.getByRole('dialog', { name: 'Delete this item?' });
    const secondary = within(dialog).getByRole('button', { name: 'Keep item' });
    await expect(secondary).toHaveFocus();
    await userEvent.click(secondary);
    await expect(dialog).not.toBeVisible();
  },
};

export const MobileLongContent: Story = {
  globals: { viewport: { value: 'mobile', isRotated: false } },
  args: {
    title: 'Review the delivery instructions for this order',
    message: 'Review all destinations before confirming dispatch.',
  },
  render: (args) => render(args, 'light', true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    const dialog = canvas.getByRole('dialog');
    await expect(dialog.getBoundingClientRect().width).toBe(328);
    const body = dialog.querySelector('.dds-modal__body')!;
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    for (const button of dialog.querySelectorAll('.dds-modal__actions button')) {
      await expect(button.getBoundingClientRect().height).toBe(48);
      await expect(button.getBoundingClientRect().width).toBeGreaterThan(280);
    }
    await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Keep editing' }));
  },
};

export const RequestRecovery: Story = {
  decorators: [moduleMetadata({ imports: [ModalRequestExampleComponent] })],
  render: () => ({ template: '<dds-modal-request-example />' }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Application-owned save simulation: the first request fails after 1.2 seconds, preserving the field; retry succeeds and shows an auto-dismiss success Toast. A real application must bound request time, reconcile uncertain outcomes and supply field-level validation.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Edit delivery instructions' });
    await userEvent.click(trigger);
    const input = canvas.getByRole('textbox', { name: 'Delivery instructions' });
    await userEvent.clear(input);
    await userEvent.type(input, 'Call the receiving team on arrival.');
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(canvas.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('dialog')).toBeVisible();
    await waitFor(
      () => expect(canvas.getByRole('alert')).toHaveTextContent('Your changes are preserved'),
      { timeout: 4000 },
    );
    await expect(input).toHaveValue('Call the receiving team on arrival.');
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 4000,
    });
    await expect(canvas.getByText('Delivery instructions saved in this example.')).toBeVisible();
    await expect(trigger).toHaveFocus();
  },
};
