import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RatingComponent } from '../app/components/rating/rating.component';
import { ButtonComponent } from '../app/components/button/button.component';

type Args = RatingComponent & { onValueChange: ReturnType<typeof fn> };
const meta: Meta<Args> = {
  title: 'Building Blocks/Forms/Rating',
  component: RatingComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Five-point feedback using native radios. Start at 0 (unanswered); 1–2 is Low, 3 Medium, 4–5 High. Stars fill cumulatively; Smileys select one face. Tab enters/leaves the group, arrows move and select, and Space selects. Selection does not submit a form. Both sizes keep 44px targets. Hide the label only beside a visible question; keep a meaningful label for assistive technology. Fractional/out-of-range values are treated as unanswered; averages need a separate read-only pattern. [Figma](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=374-3373).',
      },
    },
  },
  args: {
    value: 0,
    styleType: 'stars',
    size: 'default',
    label: 'How was your experience?',
    supportingText: 'Choose one rating.',
    showLabel: true,
    showSupportingText: true,
    disabled: false,
    onValueChange: fn(),
  },
  argTypes: {
    styleType: { control: 'radio', options: ['stars', 'smileys'] },
    size: { control: 'radio', options: ['default', 'compact'] },
    value: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    onValueChange: { action: 'valueChange', table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `<dds-rating [value]="value" [styleType]="styleType" [size]="size" [label]="label" [supportingText]="supportingText" [showLabel]="showLabel" [showSupportingText]="showSupportingText" [disabled]="disabled" (valueChange)="value = $event; onValueChange($event)" />`,
  }),
};
export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const neutral = canvas.getByRole('radio', { name: '3 of 5, Neutral' });
    await userEvent.hover(neutral);
    await expect(canvas.getByText('Not rated')).toBeVisible();
    neutral.focus();
    await userEvent.keyboard(' ');
    await expect(neutral).toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    const satisfied = canvas.getByRole('radio', { name: '4 of 5, Satisfied' });
    await expect(satisfied).toBeChecked();
    await expect(satisfied).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(4);
    await userEvent.unhover(neutral);
  },
};

const comparison = (theme: 'light' | 'dark') => ({
  template: `<section data-theme="${theme}" style="background:var(--color-bg-default);color:var(--color-text-primary);padding:24px;display:grid;gap:24px;grid-template-columns:repeat(2,minmax(0,1fr))">
    ${(['stars', 'smileys'] as const)
      .map(
        (
          style,
        ) => `<div style="display:grid;gap:24px"><h2>${style === 'stars' ? 'Stars' : 'Smileys'}</h2>
      ${[0, 1, 3, 5].map((value) => `<dds-rating styleType="${style}" [value]="${value}" ${style === 'smileys' ? 'size="compact"' : ''} />`).join('')}
    </div>`,
      )
      .join('')}
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

export const Feedback: Story = {
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  render: () => ({
    props: { score: 0, submitted: false },
    template: `<form (submit)="$event.preventDefault(); submitted = true" style="display:grid;gap:24px">
      <dds-rating label="How was your delivery?" supportingText="Rate the delivery, from very dissatisfied to very satisfied." [value]="score" (valueChange)="score = $event; submitted = false" />
      <dds-button type="submit" [disabled]="score === 0">Send feedback</dds-button>
      @if (submitted) { <p role="status">Thank you. Your rating was {{ score }} of 5.</p> }
    </form>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Send feedback' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('radio', { name: '5 of 5, Very satisfied' }));
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('5 of 5');
  },
};

export const LayoutAndDisabled: Story = {
  render: () => ({
    template: `<div style="width:272px;display:grid;gap:32px">
    <dds-rating size="compact" styleType="smileys" label="How satisfied are you with the help you received from our customer support team?" supportingText="Choose the face that best reflects your experience. Your feedback is optional." />
    <dds-rating styleType="stars" size="compact" [value]="4" />
    <dds-rating styleType="smileys" [value]="2" [disabled]="true" label="Previously submitted feedback" supportingText="Editing is currently unavailable." />
  </div>`,
  }),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', {
      name: 'Previously submitted feedback',
    });
    const radio = within(group).getByRole('radio', { name: '5 of 5, Very satisfied' });
    await expect(radio).toBeDisabled();
    await userEvent.click(radio);
    await expect(within(group).getByRole('radio', { name: '2 of 5, Dissatisfied' })).toBeChecked();
  },
};
