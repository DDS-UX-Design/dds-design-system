import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  TextareaComponent,
  TextareaSize,
  TextareaState,
} from '../app/components/textarea/textarea.component';

type TextareaStoryArgs = {
  label: string;
  value: string;
  placeholder: string;
  size: TextareaSize;
  state: TextareaState;
  maxLength: number;
  required: boolean;
  showLabel: boolean;
  ariaLabel: string;
  helperText: string;
  showHelperText: boolean;
  errorMessage: string;
  showCharacterCount: boolean;
  loading: boolean;
  onValueChange: ReturnType<typeof fn>;
};

const exampleResponse =
  'I need assistance updating the delivery address for my recent order before it is dispatched.';

const meta: Meta<TextareaStoryArgs> = {
  title: 'Building Blocks/Forms/Textarea',
  component: TextareaComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A multi-line field for responses that need more space than a text input. Use a clear label, explain format or length constraints in helper text, and reserve error text for actionable validation guidance.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Visible label describing the response.',
      table: { category: 'Content' },
    },
    value: { control: 'text', description: 'Current field value.', table: { category: 'Content' } },
    placeholder: {
      control: 'text',
      description: 'Short example or prompt shown while the field is empty.',
      table: { category: 'Content' },
    },
    size: {
      control: 'radio',
      options: ['large', 'small'],
      description: 'Large or Small typography treatment from the design specification.',
      table: { category: 'Appearance', defaultValue: { summary: 'large' } },
    },
    state: {
      control: 'radio',
      options: ['default', 'focused', 'disabled', 'error'],
      description: 'Visual and interaction state of the field.',
      table: { category: 'State', defaultValue: { summary: 'default' } },
    },
    maxLength: {
      control: { type: 'number', min: 1, step: 1 },
      description: 'Maximum accepted character count.',
      table: { category: 'Validation', defaultValue: { summary: '150' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required.',
      table: { category: 'Validation' },
    },
    showLabel: {
      control: 'boolean',
      description: 'Shows the visible label.',
      table: { category: 'Content' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name used when the visible label is hidden.',
      if: { arg: 'showLabel', eq: false },
      table: { category: 'Accessibility' },
    },
    helperText: {
      control: 'text',
      description: 'Optional guidance beneath the field.',
      table: { category: 'Content' },
    },
    showHelperText: {
      control: 'boolean',
      description: 'Shows guidance beneath non-error fields.',
      table: { category: 'Content' },
    },
    errorMessage: {
      control: 'text',
      description: 'Actionable validation guidance.',
      if: { arg: 'state', eq: 'error' },
      table: { category: 'Validation' },
    },
    showCharacterCount: {
      control: 'boolean',
      description: 'Shows the live current and maximum character count.',
      table: { category: 'Validation' },
    },
    loading: { control: 'boolean', table: { category: 'State' } },
    onValueChange: { action: 'valueChange', table: { disable: true } },
  },
  args: {
    label: 'Additional information',
    value: '',
    placeholder: 'Tell us how we can help…',
    size: 'large',
    state: 'default',
    maxLength: 150,
    required: true,
    showLabel: true,
    ariaLabel: 'Additional information',
    helperText: 'Include any details that will help us resolve your request.',
    showHelperText: true,
    errorMessage: 'Enter some information before continuing.',
    showCharacterCount: true,
    loading: false,
    onValueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-textarea
        [label]="label"
        [value]="value"
        [placeholder]="placeholder"
        [size]="size"
        [state]="state"
        [maxLength]="maxLength"
        [required]="required"
        [showLabel]="showLabel"
        [ariaLabel]="ariaLabel"
        [helperText]="helperText"
        [showHelperText]="showHelperText"
        [errorMessage]="errorMessage"
        [showCharacterCount]="showCharacterCount"
        [loading]="loading"
        (valueChange)="value = $event; onValueChange($event)"
      ></dds-textarea>
    `,
  }),
};

export default meta;
type Story = StoryObj<TextareaStoryArgs>;

export const Playground: Story = {};

export const WithContent: Story = {
  name: 'With content',
  args: { value: exampleResponse },
};

export const Focused: Story = {
  args: { state: 'focused', value: exampleResponse },
};

export const Error: Story = {
  args: { state: 'error', value: '' },
};

export const Disabled: Story = {
  args: { state: 'disabled', value: exampleResponse },
};

export const Small: Story = {
  args: { size: 'small' },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Loading textarea')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};

export const WithoutCharacterCount: Story = {
  name: 'Without character count',
  args: { showCharacterCount: false },
};

export const EnterResponse: Story = {
  name: 'Enter a response',
  args: { maxLength: 40 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: /additional information/i });

    await userEvent.type(textarea, 'Please call me before delivery.');
    await expect(textarea).toHaveValue('Please call me before delivery.');
    await expect(canvas.getByText('31/40')).toBeInTheDocument();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('Please call me before delivery.');
  },
};

const themedStates = (theme: 'light' | 'dark', narrow = false) => ({
  props: { exampleResponse },
  template: `
    <section data-theme="${theme}" style="padding:32px;background:var(--color-bg-default);color:var(--color-text-primary);box-sizing:border-box;${narrow ? 'width:320px;max-width:100%' : ''}">
      <div style="display:grid;gap:24px;grid-template-columns:${narrow ? 'minmax(0,1fr)' : 'repeat(2,minmax(0,460px))'};align-items:start">
        <dds-textarea label="Delivery instructions" placeholder="Tell us where to leave your order…" helperText="Include any access requirements." [required]="true" />
        <dds-textarea label="Short delivery note" size="small" placeholder="Add a note…" helperText="Visible to the delivery team." [required]="true" />
        <dds-textarea label="Dispatch request" state="focused" [value]="exampleResponse" helperText="You can update this before dispatch." />
        <dds-textarea label="Packing request" size="small" state="focused" [value]="exampleResponse" />
        <dds-textarea label="Cancellation reason" state="error" errorMessage="Explain why this order needs to be cancelled before continuing." [required]="true" />
        <dds-textarea label="Return reason" size="small" state="error" errorMessage="Describe the problem with your delivery." [required]="true" />
        <dds-textarea label="Archived instructions" state="disabled" [value]="exampleResponse" [required]="true" />
        <dds-textarea label="Archived note" size="small" state="disabled" [required]="true" />
      </div>
    </section>`,
});

const verifyStates: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const empty = canvas.getByRole('textbox', { name: /Delivery instructions/ });
  const field = empty.closest('.dds-textarea__field')!;
  const rect = field.getBoundingClientRect();
  await expect(rect.height).toBe(80);
  await expect(empty.getBoundingClientRect().left - rect.left).toBe(12);
  await userEvent.click(empty);
  await expect(empty).toHaveFocus();
  await expect(field.getBoundingClientRect().height).toBe(80);
  const invalid = canvas.getByRole('textbox', { name: /Cancellation reason/ });
  await userEvent.click(invalid);
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAccessibleDescription(/Explain why this order/);
  const disabled = canvas.getByRole('textbox', { name: /Archived instructions/ });
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveAccessibleDescription(/\/150/);
  await expect(
    disabled.closest('.dds-textarea')!.querySelector('.dds-textarea__supporting-text'),
  ).toBeNull();
  const probe = document.createElement('span');
  probe.style.color = 'var(--color-border-focus-danger)';
  field.parentElement!.appendChild(probe);
  await expect(getComputedStyle(invalid.closest('.dds-textarea__field')!).boxShadow).toContain(
    getComputedStyle(probe).color,
  );
  probe.remove();
};

export const Light: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => themedStates('light'),
  play: verifyStates,
};

export const Dark: Story = {
  parameters: Light.parameters,
  render: () => themedStates('dark'),
  play: verifyStates,
};

export const NarrowLongContent: Story = {
  args: {
    value: exampleResponse,
    label: 'Delivery and access instructions for the distribution centre',
    helperText:
      'Include the entrance, receiving contact and any restrictions the driver should know about.',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="width:320px;max-width:100%">${story}</div>`),
  ],
};
