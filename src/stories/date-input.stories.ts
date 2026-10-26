import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import {
  DateInputComponent,
  DateInputSize,
  DateInputState,
} from '../app/components/date-input/date-input.component';

type DateInputStoryArgs = {
  label: string;
  placeholder: string;
  value: string;
  helperText: string;
  errorMessage: string;
  size: DateInputSize;
  state: DateInputState;
  required: boolean;
  showLabel: boolean;
  showHelperText: boolean;
  showErrorMessage: boolean;
  ariaLabel?: string;
  disabled: boolean;
  name: string;
  autocomplete: string;
  loading: boolean;
  selectionMode: 'single' | 'range';
  calendarEnabled: boolean;
  minDate: string;
  maxDate: string;
};

const meta: Meta<DateInputStoryArgs> = {
  title: 'Building Blocks/Forms/Date Input',
  component: DateInputComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Date entry with an optional Monday-first calendar. Single values use DD/MM/YYYY; range values use DD/MM/YYYY – DD/MM/YYYY (typed spaced hyphens are also accepted). The calendar icon or Alt+Down opens the popup. Arrow keys move by day/week, Home/End move within the week, Page Up/Down changes month (Shift changes year), Enter/Space selects, and Escape or outside interaction dismisses. Today selects today when allowed; Clear removes the value. In range mode, choose start then end; an earlier second date restarts, same-day and cross-month ranges are inclusive. An incomplete calendar edit is discarded on dismissal and does not emit valueChange. Calendar bounds use DD/MM/YYYY; malformed or reversed bounds disable date choices. Text input still emits raw strings: single-date text validation remains application-owned, while ranges show reversed-order/bounds errors immediately and incomplete-format errors on blur. Disabled/loading controls cannot open. Set calendarEnabled=false for text-only entry. Themes inherit data-theme; popup placement adjusts at viewport edges. [Figma Date Picker and Date Range](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=24-3526).',
      },
    },
  },
  argTypes: {
    selectionMode: { control: 'radio', options: ['single', 'range'] },
    calendarEnabled: { control: 'boolean' },
    minDate: { control: 'text', description: 'Inclusive earliest calendar date, DD/MM/YYYY.' },
    maxDate: { control: 'text', description: 'Inclusive latest calendar date, DD/MM/YYYY.' },
    label: { control: 'text', table: { category: 'Content' } },
    placeholder: { control: 'text', table: { category: 'Content' } },
    value: { control: 'text', table: { category: 'Content' } },
    helperText: { control: 'text', table: { category: 'Content' } },
    errorMessage: {
      control: 'text',
      if: { arg: 'state', eq: 'error' },
      table: { category: 'Validation' },
    },
    size: { control: 'radio', options: ['desktop', 'mobile'], table: { category: 'Appearance' } },
    state: {
      control: 'radio',
      options: ['default', 'focused', 'error'],
      table: { category: 'State' },
    },
    required: { control: 'boolean', table: { category: 'Validation' } },
    showLabel: { control: 'boolean', table: { category: 'Content' } },
    showHelperText: { control: 'boolean', table: { category: 'Content' } },
    showErrorMessage: { control: 'boolean', table: { category: 'Validation' } },
    ariaLabel: {
      control: 'text',
      if: { arg: 'showLabel', eq: false },
      table: { category: 'Accessibility' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    name: { control: 'text', table: { category: 'Form' } },
    autocomplete: { control: 'text', table: { category: 'Form' } },
    loading: { control: 'boolean', table: { category: 'State' } },
  },
  args: {
    label: 'Date',
    selectionMode: 'single',
    calendarEnabled: true,
    minDate: '',
    maxDate: '',
    placeholder: 'DD/MM/YYYY',
    value: '',
    helperText: 'Enter the date in DD/MM/YYYY format',
    errorMessage: 'Enter a valid date in DD/MM/YYYY format',
    size: 'desktop',
    state: 'default',
    required: true,
    showLabel: true,
    showHelperText: true,
    showErrorMessage: true,
    ariaLabel: 'Date',
    disabled: false,
    name: 'date',
    autocomplete: 'off',
    loading: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-date-input
        [label]="label" [selectionMode]="selectionMode" [calendarEnabled]="calendarEnabled" [minDate]="minDate" [maxDate]="maxDate"
        [placeholder]="placeholder"
        [value]="value"
        [helperText]="helperText"
        [errorMessage]="errorMessage"
        [size]="size"
        [state]="state"
        [required]="required"
        [showLabel]="showLabel"
        [showHelperText]="showHelperText"
        [showErrorMessage]="showErrorMessage"
        [ariaLabel]="ariaLabel"
        [disabled]="disabled"
        [name]="name"
        [autocomplete]="autocomplete"
        [loading]="loading"
        (valueChange)="value = $event"
      ></dds-date-input>
    `,
  }),
};

export default meta;
type Story = StoryObj<DateInputStoryArgs>;

export const Playground: Story = {};
export const Default: Story = {};
export const Filled: Story = { args: { value: '23/05/2026' } };
export const Focused: Story = { args: { state: 'focused' } };
export const Error: Story = { args: { state: 'error', value: '31/02/2026' } };
export const Mobile: Story = {
  args: { size: 'mobile', value: '23/05/2026', minDate: '05/05/2026' },
  globals: { viewport: { value: 'mobile', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Choose Date' }));
    const popup = canvas.getByRole('dialog');
    await expect(popup.querySelector('.dds-calendar')!.getBoundingClientRect().width).toBe(314);
    await expect(popup.querySelector('.dds-calendar__day')!.getBoundingClientRect().height).toBe(
      40,
    );
    await userEvent.keyboard('{Escape}');
  },
};
export const Disabled: Story = { args: { value: '23/05/2026', disabled: true } };
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Loading date input')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};
export const Entry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Date' });
    await userEvent.type(input, '23/05/2026');
    await expect(input).toHaveValue('23/05/2026');
  },
};

const themed = (theme: 'light' | 'dark') => ({
  props: { single: '23/05/2026', period: '18/05/2026 – 23/05/2026' },
  template: `<section data-theme="${theme}" style="padding:24px;min-height:520px;background:var(--color-bg-default);color:var(--color-text-primary);display:grid;align-content:start;gap:24px">
    <dds-date-input label="Delivery date" [value]="single" minDate="05/05/2026" (valueChange)="single = $event" />
    <dds-date-input label="Reporting period" selectionMode="range" placeholder="Start date – End date" helperText="Select a start and end date" [value]="period" minDate="05/05/2026" (valueChange)="period = $event" />
  </section>`,
});
const verifyTheme: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Choose Delivery date' }));
  let popup = canvas.getByRole('dialog');
  await expect(popup.querySelector('.dds-calendar')!.getBoundingClientRect().width).toBe(286);
  await expect(popup.querySelector('.dds-calendar')!.getBoundingClientRect().height).toBe(386);
  await expect(within(popup).getByRole('button', { name: 'Friday 1 May 2026' })).toBeDisabled();
  await userEvent.click(within(popup).getByRole('button', { name: 'Monday 25 May 2026' }));
  await expect(canvas.getByRole('textbox', { name: 'Delivery date' })).toHaveValue('25/05/2026');
  await userEvent.click(canvas.getByRole('button', { name: 'Choose Reporting period' }));
  popup = canvas.getByRole('dialog');
  const probe = document.createElement('span');
  popup.appendChild(probe);
  try {
    probe.style.color = 'var(--color-interactive-default-opacity-10)';
    await expect(
      getComputedStyle(popup.querySelector('[data-date="20/05/2026"]')!).backgroundColor,
    ).toBe(getComputedStyle(probe).color);
    probe.style.color = 'var(--color-interactive-default)';
    await expect(
      getComputedStyle(popup.querySelector('[data-date="18/05/2026"]')!).backgroundColor,
    ).toBe(getComputedStyle(probe).color);
  } finally {
    probe.remove();
  }
  await userEvent.click(within(popup).getByRole('button', { name: 'Monday 25 May 2026' }));
  await expect(canvas.getByRole('textbox', { name: 'Reporting period' })).toHaveValue(
    '25/05/2026 – End date',
  );
  await expect(popup).toHaveTextContent('Choose end date');
  await userEvent.click(within(popup).getByRole('button', { name: 'Thursday 28 May 2026' }));
  await expect(canvas.getByRole('textbox', { name: 'Reporting period' })).toHaveValue(
    '25/05/2026 – 28/05/2026',
  );
};
export const Light: Story = {
  render: () => themed('light'),
  play: verifyTheme,
  parameters: { controls: { disable: true }, layout: 'padded' },
};
export const Dark: Story = {
  render: () => themed('dark'),
  play: verifyTheme,
  parameters: Light.parameters,
};

export const DateRange: Story = {
  args: {
    label: 'Date range',
    selectionMode: 'range',
    value: '18/05/2026 – 23/05/2026',
    placeholder: 'Start date – End date',
    helperText: 'Select a start and end date',
    minDate: '05/05/2026',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Choose Date range' });
    await userEvent.click(trigger);
    let popup = canvas.getByRole('dialog');
    await userEvent.click(within(popup).getByRole('button', { name: 'Friday 29 May 2026' }));
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('textbox')).toHaveValue('18/05/2026 – 23/05/2026');
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    popup = canvas.getByRole('dialog');
    await userEvent.click(within(popup).getByRole('button', { name: 'Friday 29 May 2026' }));
    await userEvent.click(within(popup).getByRole('button', { name: 'Next month' }));
    await userEvent.click(within(popup).getByRole('button', { name: 'Tuesday 2 June 2026' }));
    await expect(canvas.getByRole('textbox')).toHaveValue('29/05/2026 – 02/06/2026');
  },
};
export const RangeValidation: Story = {
  args: { ...DateRange.args, value: '' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Date range' });
    await userEvent.type(input, '23/05/2026 – 18/05/2026');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(
      within(canvasElement).getByText('End date must be on or after start date'),
    ).toBeVisible();
  },
};
