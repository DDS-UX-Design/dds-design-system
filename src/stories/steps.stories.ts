import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { StepsComponent, StepsItem } from '../app/components/steps/steps.component';
import { StepsFormExampleComponent } from './steps-form.example';

const formItems: StepsItem[] = ['Business details', 'Locations', 'Team', 'Review'].map((label) => ({
  label,
}));
const orderItems: StepsItem[] = ['Order placed', 'Confirmed', 'Dispatched', 'Delivered'].map(
  (label) => ({ label }),
);
const meta: Meta<StepsComponent> = {
  title: 'Building Blocks/Navigation/Steps',
  component: StepsComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Ordered process progress. Horizontal form steps stack vertically when the container cannot fit 128px items with 24px gaps; explicit vertical orientation is suited to order tracking. currentStep is one-based and bounded to the items. By default, preceding stages are complete and following stages are upcoming: only advance after saving valid data. Use item.status to retain explicit saved/error states when returning to earlier stages. The current item stays current unless it has an error. “Remaining” counts stages after the current position, not unsaved stages. An href becomes a native link only on a completed item; the application owns safe navigation and data preservation. Steps does not control forms or mutate progress when clicked. Keep Back/Continue beside the form and show a confirmation after submission. No loading, skipped, branching or disabled variants are defined. Themes inherit from data-theme. [Figma main components](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=1922-328).',
      },
    },
  },
  args: {
    items: formItems,
    currentStep: 2,
    orientation: 'horizontal',
    ariaLabel: 'Store setup progress',
  },
  argTypes: {
    items: { control: 'object' },
    currentStep: { control: { type: 'number', min: 1, step: 1 } },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
  },
};
export default meta;
type Story = StoryObj<StepsComponent>;

export const Playground: Story = {};

const themed = (theme: 'light' | 'dark') => ({
  props: {
    formItems,
    orderItems,
    invalidItems: formItems.map((item, index) => ({
      ...item,
      status: index === 1 ? 'error' : undefined,
    })),
  },
  template: `<section data-theme="${theme}" style="padding:24px;background:var(--color-bg-elevated);color:var(--color-text-primary);display:grid;gap:32px">
    <div><h2>Store setup</h2><dds-steps [items]="formItems" [currentStep]="2" ariaLabel="Store setup progress" /></div>
    <div><h2>Order #ORD-1048</h2><dds-steps [items]="orderItems" [currentStep]="3" orientation="vertical" ariaLabel="Order tracking" /></div>
    <div><h2>Location needs attention</h2><dds-steps [items]="invalidItems" [currentStep]="2" ariaLabel="Setup validation" /></div>
  </section>`,
});

const verify: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const setup = canvas.getByRole('list', { name: 'Store setup progress' });
  const current = setup.querySelector('[aria-current="step"]')!;
  await expect(current).toHaveTextContent('Locations');
  const markers = setup.querySelectorAll('.dds-steps__marker');
  for (const marker of markers) {
    await expect(marker.getBoundingClientRect().width).toBe(32);
    await expect(marker.getBoundingClientRect().height).toBe(32);
  }
  if (setup.closest('.dds-steps')!.getAttribute('data-orientation') === 'horizontal') {
    await expect(setup.closest('.dds-steps')!.getBoundingClientRect().height).toBe(132);
  }
  const tracking = canvas.getByRole('list', { name: 'Order tracking' });
  await expect(tracking.closest('.dds-steps')!.getBoundingClientRect().height).toBe(304);
  const invalid = canvas
    .getByRole('list', { name: 'Setup validation' })
    .querySelector('[aria-current="step"]')!;
  await expect(invalid).toHaveAttribute('data-state', 'error');
  await expect(invalid).toHaveTextContent('Needs attention');
  const probe = document.createElement('span');
  invalid.appendChild(probe);
  probe.style.color = 'var(--color-feedback-error)';
  await expect(getComputedStyle(invalid.querySelector('.dds-steps__status')!).color).toBe(
    getComputedStyle(probe).color,
  );
  probe.style.color = 'var(--color-interactive-default)';
  await expect(getComputedStyle(current.querySelector('.dds-steps__marker')!).backgroundColor).toBe(
    getComputedStyle(probe).color,
  );
  probe.remove();
};

export const Light: Story = {
  parameters: { controls: { disable: true } },
  render: () => themed('light'),
  play: verify,
};
export const Dark: Story = {
  parameters: Light.parameters,
  render: () => themed('dark'),
  play: verify,
};

const narrow = (theme: 'light' | 'dark') => ({
  props: {
    items: [
      'Business and registered trading details',
      'Warehouse locations and delivery restrictions',
      'Team permissions and contacts',
    ].map((label) => ({ label })),
  },
  template: `<section data-theme="${theme}" style="width:280px;max-width:100%;padding:16px;background:var(--color-bg-elevated);color:var(--color-text-primary)"><dds-steps [items]="items" [currentStep]="2" ariaLabel="Narrow setup progress" /></section>`,
});
const verifyNarrow: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const list = within(canvasElement).getByRole('list', { name: 'Narrow setup progress' });
  await waitFor(() =>
    expect(list.closest('.dds-steps')).toHaveAttribute('data-orientation', 'vertical'),
  );
  await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
};
export const NarrowLight: Story = { render: () => narrow('light'), play: verifyNarrow };
export const NarrowDark: Story = { render: () => narrow('dark'), play: verifyNarrow };

export const CompletedLinks: Story = {
  args: {
    currentStep: 3,
    items: formItems.map((item, index) => ({ ...item, href: `#saved-stage-${index + 1}` })),
  },
  render: (args) => ({
    props: args,
    template: `<dds-steps [items]="items" [currentStep]="currentStep" [orientation]="orientation" [ariaLabel]="ariaLabel" /><section id="saved-stage-1"><h3>Business details</h3><p>Saved business: Nairobi Distribution</p></section><section id="saved-stage-2"><h3>Locations</h3><p>Saved location: Westlands</p></section>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Only completed stages expose their supplied href. Use this with application-owned routes or same-page targets that preserve saved form data.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
    const first = canvas.getByRole('link', { name: 'Business details' });
    first.focus();
    await expect(first).toHaveFocus();
    await expect(canvas.queryByRole('link', { name: 'Review' })).not.toBeInTheDocument();
  },
};

export const ValidatedForm: Story = {
  decorators: [moduleMetadata({ imports: [StepsFormExampleComponent] })],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Example application logic validates required fields, saves values in memory, preserves them on Back, and replaces progress with a success message after submission. Wire real save requests before advancing in production.',
      },
    },
  },
  render: () => ({ template: '<dds-steps-form-example />' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(canvas.getByRole('textbox', { name: 'Business name' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(canvas.getByText('Needs attention')).toBeInTheDocument();
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Business name' }),
      'Nairobi Distribution',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await userEvent.type(canvas.getByRole('textbox', { name: 'Primary location' }), 'Westlands');
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await expect(canvas.getByRole('textbox', { name: 'Business name' })).toHaveValue(
      'Nairobi Distribution',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(canvas.getByRole('textbox', { name: 'Primary location' })).toHaveValue(
      'Westlands',
    );
  },
};
