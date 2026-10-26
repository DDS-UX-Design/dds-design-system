import { type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  ButtonComponent,
  ButtonIconType,
  ButtonIconAnimation,
  ButtonSize,
  ButtonState,
  ButtonStyle,
  ButtonVariant,
} from '../app/components/button/button.component';
import { DdsIconName, DDS_ICON_NAMES } from '../app/components/icon/icon.component';

type ButtonStoryArgs = {
  text: string;
  variant: ButtonVariant;
  state: ButtonState;
  styleType: ButtonStyle;
  size: ButtonSize;
  iconType: ButtonIconType;
  icon: DdsIconName;
  iconAnimation: ButtonIconAnimation;
  ariaLabel?: string;
  disabled: boolean;
  fullWidth: boolean;
  type: 'button' | 'submit' | 'reset';
};

const meta: Meta<ButtonStoryArgs> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Buttons trigger an immediate action. Use Primary for the main action in a view, Secondary for supporting actions, Ghost for low-emphasis actions, and Danger only for destructive actions. Use a concise verb-led label. Icon-only buttons require an ariaLabel, and a view should usually contain only one primary action. Danger is supported with Primary; Ghost supports text and leading/trailing icons, not icon-only. State is a design preview; use disabled for application behaviour. Icon animation is visual feedback, not a loading controller.',
      },
    },
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Visual treatment that signals the button’s importance and purpose.',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'focused', 'disabled'],
      description: 'Preview state used by design reviews; use disabled for application behavior.',
      table: { category: 'State', defaultValue: { summary: 'default' } },
    },
    styleType: {
      name: 'style',
      control: 'select',
      options: ['default', 'danger'],
      description: 'Destructive treatment for Primary buttons only.',
      if: { arg: 'variant', eq: 'primary' },
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'radio',
      options: ['large', 'medium', 'small'],
      description: 'Control the height and padding to fit different layouts.',
      table: { category: 'Appearance', defaultValue: { summary: 'large' } },
    },
    iconType: {
      control: 'select',
      options: ['no-icon', 'left-icon', 'right-icon', 'icon-only'],
      description:
        'Leading/trailing icons work with every treatment. Icon-only is supported for Primary, Secondary and Danger; do not use it with Ghost.',
      table: { category: 'Content', defaultValue: { summary: 'no-icon' } },
    },
    icon: {
      control: 'select',
      options: DDS_ICON_NAMES,
      description: 'Icon to render when the button uses an icon placement option.',
      if: { arg: 'iconType', neq: 'no-icon' },
      table: { category: 'Content', defaultValue: { summary: 'info' } },
    },
    iconAnimation: {
      control: 'select',
      options: ['none', 'spin', 'spin-on-press'],
      description:
        'Optional icon motion. Respects reduced-motion preferences; does not manage loading or disabled state.',
      if: { arg: 'iconType', neq: 'no-icon' },
      table: { category: 'Content' },
    },
    ariaLabel: {
      control: 'text',
      description:
        'Accessible label required for icon-only buttons when no visible text is present.',
      if: { arg: 'iconType', eq: 'icon-only' },
      table: { category: 'Accessibility' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button and applies the disabled visual treatment.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Expands the button to fill the available width of its container.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Native button type used for forms and semantic button behavior.',
      table: { category: 'Behavior', defaultValue: { summary: 'button' } },
    },
    text: {
      control: 'text',
      description: 'Visible, verb-led label. Hidden when iconType is icon-only.',
      if: { arg: 'iconType', neq: 'icon-only' },
      table: { category: 'Content' },
    },
  },
  args: {
    text: 'Button',
    variant: 'primary',
    state: 'default',
    styleType: 'default',
    size: 'large',
    iconType: 'no-icon',
    icon: 'info',
    iconAnimation: 'none',
    ariaLabel: 'Action button',
    disabled: false,
    fullWidth: false,
    type: 'button',
  },
  render: (args) => ({
    props: args,
    template: `
      <dds-button
        [variant]="variant"
        [state]="state"
        [styleType]="styleType"
        [size]="size"
        [iconType]="iconType"
        [icon]="icon"
        [iconAnimation]="iconAnimation"
        [ariaLabel]="ariaLabel"
        [disabled]="disabled"
        [fullWidth]="fullWidth"
        [type]="type"
      >
        {{ text }}
      </dds-button>
    `,
  }),
};

export default meta;
type Story = StoryObj<ButtonStoryArgs>;

const buttonExample = (
  label: string,
  variant: ButtonVariant,
  iconType: ButtonIconType,
  styleType: ButtonStyle = 'default',
) => {
  const icon = styleType === 'danger' ? 'trash-2' : 'arrow-right';
  const content = iconType === 'icon-only' ? '' : label;
  const ariaLabel = iconType === 'icon-only' ? `ariaLabel="${label}"` : '';

  return `<dds-button variant="${variant}" styleType="${styleType}" iconType="${iconType}" icon="${icon}" ${ariaLabel}>${content}</dds-button>`;
};

const comparisonRows = [
  { label: 'Primary', variant: 'primary', styleType: 'default', iconOnly: true },
  { label: 'Secondary', variant: 'secondary', styleType: 'default', iconOnly: true },
  { label: 'Danger', variant: 'primary', styleType: 'danger', iconOnly: true },
  { label: 'Ghost', variant: 'ghost', styleType: 'default', iconOnly: false },
] as const;

const comparisonMarkup = comparisonRows
  .map(({ label, variant, styleType, iconOnly }) => {
    const examples = (['no-icon', 'left-icon', 'right-icon'] as const)
      .map((iconType) => buttonExample(`${label} action`, variant, iconType, styleType))
      .concat(iconOnly ? buttonExample(`${label} action`, variant, 'icon-only', styleType) : [])
      .join('');

    return `<section class="button-comparison__row"><h3>${label}</h3><div class="button-comparison__examples">${examples}</div></section>`;
  })
  .join('');

export const Playground: Story = {
  args: {
    text: 'Continue',
    iconType: 'right-icon',
    icon: 'arrow-right',
    ariaLabel: 'Continue',
  },
  parameters: {
    controls: {
      include: [
        'text',
        'variant',
        'styleType',
        'state',
        'size',
        'iconType',
        'icon',
        'iconAnimation',
        'ariaLabel',
        'disabled',
        'fullWidth',
        'type',
      ],
    },
    docs: {
      description: {
        story:
          'Use the Controls panel alongside the Canvas to explore button variants, icon placement, icon choice, states, and sizing.',
      },
    },
  },
};

export const VariantsAndIcons: Story = {
  name: 'Variants and icons',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Compares emphasis levels and supported icon placements. Ghost intentionally has no icon-only option.',
      },
    },
    layout: 'padded',
  },
  render: () => ({
    template: `<div class="button-comparison">${comparisonMarkup}</div>`,
    styles: [
      `
        .button-comparison { display: grid; gap: 32px; }
        .button-comparison__row { display: grid; gap: 12px; }
        .button-comparison__row h3 { margin: 0; font-size: 14px; font-weight: 600; }
        .button-comparison__examples { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
      `,
    ],
  }),
  play: async ({ canvasElement }) => {
    const buttons = canvasElement.querySelectorAll<HTMLButtonElement>('.dds-button--icon-only');
    await expect(buttons).toHaveLength(3);
    for (const button of buttons) {
      await expect(button).toHaveAccessibleName();
      await expect(button.querySelector('.dds-button__label')).toBeNull();
    }
  },
};

export const Sizes: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => ({
    template: `<div style="display:grid;gap:24px">
    ${(['large', 'medium', 'small'] as const).map((size, index) => `<section data-size="${size}" style="display:grid;gap:12px"><h3>${size} · ${[48, 40, 32][index]}px</h3><div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px"><dds-button size="${size}" iconType="left-icon" icon="plus">Add item</dds-button><dds-button size="${size}" iconType="icon-only" icon="plus" ariaLabel="Add item"></dds-button></div></section>`).join('')}
  </div>`,
  }),
  play: async ({ canvasElement }) => {
    for (const [size, height, iconSize, fontSize] of [
      ['large', 48, 24, 16],
      ['medium', 40, 20, 14],
      ['small', 32, 16, 12],
    ] as const) {
      for (const host of canvasElement.querySelectorAll(`[data-size="${size}"] dds-button`)) {
        const button = host.querySelector('button')!;
        await expect(button.getBoundingClientRect().height).toBe(height);
        await expect(getComputedStyle(button).fontSize).toBe(`${fontSize}px`);
        await expect(host.querySelector('svg')!.getBoundingClientRect().width).toBe(iconSize);
        if (button.classList.contains('dds-button--icon-only'))
          await expect(button.getBoundingClientRect().width).toBe(height);
      }
    }
  },
};

/** Same component instances under scoped semantic modes; no theme prop required. */
const themedMatrix = (theme: 'light' | 'dark') => ({
  template: `
    <section data-theme="${theme}" style="padding:var(--space-6);background:var(--color-bg-default);color:var(--color-text-primary)">
      <h2>Button · ${theme}</h2>
      <p>Default, hover, focus and disabled. Colours inherit the nearest theme.</p>
      ${comparisonRows
        .map(
          ({ label, variant, styleType }) => `
        <div style="margin-bottom:var(--space-6)">
          <h3>${label}</h3>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-6)">
            ${(['default', 'hover', 'focused', 'disabled'] as const)
              .map(
                (state) => `
              <div style="display:grid;gap:var(--space-3);justify-items:start" data-variant="${label.toLowerCase()}" data-state="${state}">
                <span>${state}</span>
                <dds-button variant="${variant}" styleType="${styleType}" state="${state}" size="medium">${label === 'Danger' ? 'Delete item' : 'Save changes'}</dds-button>
              </div>`,
              )
              .join('')}
          </div>
        </div>`,
        )
        .join('')}
    </section>`,
});

const verifySemanticColours = async (canvasElement: HTMLElement) => {
  const section = canvasElement.querySelector('section[data-theme]')!;
  const probe = section.ownerDocument.createElement('span');
  section.appendChild(probe);
  const colour = (token: string) => {
    probe.style.backgroundColor = `var(--${token})`;
    return probe.ownerDocument.defaultView!.getComputedStyle(probe).backgroundColor;
  };
  try {
    for (const cell of Array.from(
      section.querySelectorAll<HTMLElement>('[data-variant][data-state]'),
    )) {
      const button = cell.querySelector('button')!;
      const variant = cell.dataset['variant'];
      const state = cell.dataset['state'];
      const disabled = state === 'disabled';
      const hover = state === 'hover';
      const bg =
        variant === 'ghost'
          ? 'color-bg-transparent'
          : disabled
            ? 'color-bg-subtle'
            : variant === 'primary'
              ? hover
                ? 'color-interactive-hover'
                : 'color-interactive-default'
              : variant === 'danger'
                ? hover
                  ? 'color-interactive-danger-hover'
                  : 'color-feedback-error'
                : hover
                  ? 'color-bg-subtle'
                  : 'color-bg-elevated';
      const fg = disabled
        ? 'color-text-disabled'
        : variant === 'primary'
          ? 'color-text-on-interactive'
          : variant === 'danger'
            ? 'color-text-on-feedback'
            : 'color-text-primary';
      await waitFor(() => {
        const actual = button.ownerDocument.defaultView!.getComputedStyle(button);
        expect(actual.backgroundColor).toBe(colour(bg));
        expect(actual.color).toBe(colour(fg));
      });
      if (disabled) await expect(button).toBeDisabled();
    }
  } finally {
    probe.remove();
  }
};

export const Light: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => themedMatrix('light'),
  play: async ({ canvasElement }) => verifySemanticColours(canvasElement),
};

export const Dark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => themedMatrix('dark'),
  play: Light.play,
};

export const Interactions: Story = {
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Real keyboard and pointer interaction, separate from the Light/Dark preview classes. Primary uses the pressed token; Danger currently reuses its hover token because no distinct destructive pressed role exists. Disabled buttons cannot activate. Hold the pointer down to review native pressed colours; synthetic story events assert activation but do not verify browser :active styling.',
      },
    },
  },
  render: () => ({
    template: `<div style="display:grid;gap:24px">${(['light', 'dark'] as const).map((theme) => `<section data-theme="${theme}" style="padding:24px;background:var(--color-bg-default);color:var(--color-text-primary)"><h3>${theme}</h3><div style="display:flex;flex-wrap:wrap;gap:16px">${comparisonRows.map(({ label, variant, styleType }) => `<dds-button variant="${variant}" styleType="${styleType}">${label} action</dds-button>`).join('')}<dds-button [disabled]="true">Unavailable action</dds-button></div></section>`).join('')}</div>`,
  }),
  play: async ({ canvasElement }) => {
    for (const section of canvasElement.querySelectorAll<HTMLElement>('section[data-theme]')) {
      const canvas = within(section);
      const probe = section.ownerDocument.createElement('span');
      section.appendChild(probe);
      const colour = (token: string) => {
        probe.style.color = `var(--${token})`;
        return getComputedStyle(probe).color;
      };
      try {
        for (const [index, { label }] of comparisonRows.entries()) {
          const button = canvas.getByRole('button', { name: `${label} action` });
          const clicks: Event[] = [];
          const clicked = (event: Event) => clicks.push(event);
          button.addEventListener('click', clicked);
          try {
            if (index === 0) button.focus();
            else await userEvent.tab();
            await expect(button).toHaveFocus();
            await expect(getComputedStyle(button).appearance).toBe('none');
            await waitFor(() => {
              const styles = getComputedStyle(button);
              const focus = colour(
                label === 'Danger' ? 'color-border-focus-danger' : 'color-border-focus',
              );
              if (label === 'Ghost') expect(styles.borderColor).toBe(focus);
              else {
                expect(styles.boxShadow).toContain('3px');
                expect(styles.boxShadow).toContain(focus);
              }
            });
            await userEvent.keyboard('{Enter}');
            await userEvent.keyboard(' ');
            await expect(clicks).toHaveLength(2);
            await userEvent.pointer({ target: button, keys: '[MouseLeft>]' });
            await userEvent.pointer({ target: button, keys: '[/MouseLeft]' });
            await expect(button).toHaveFocus();
            await expect(clicks).toHaveLength(3);
          } finally {
            button.removeEventListener('click', clicked);
          }
        }
        const disabled = canvas.getByRole('button', { name: 'Unavailable action' });
        let clicks = 0;
        const clicked = () => clicks++;
        disabled.addEventListener('click', clicked);
        try {
          await userEvent.click(disabled);
          await expect(disabled).toBeDisabled();
          await expect(disabled).not.toHaveFocus();
          await expect(clicks).toBe(0);
        } finally {
          disabled.removeEventListener('click', clicked);
        }
      } finally {
        probe.remove();
      }
    }
  },
};

export const Layout: Story = {
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Text buttons fill their parent when fullWidth is enabled. Long labels wrap while preserving the size’s minimum height. Prefer concise labels; this example deliberately stresses a narrow container.',
      },
    },
  },
  render: () => ({
    template: `<div style="width:320px;max-width:100%;display:grid;gap:24px"><section><h3>Full width</h3><dds-button [fullWidth]="true" iconType="right-icon" icon="arrow-right">Continue</dds-button></section><section><h3>Long content</h3><dds-button [fullWidth]="true" size="medium">Review delivery instructions before confirming dispatch</dds-button></section></div>`,
  }),
  play: async ({ canvasElement }) => {
    for (const button of canvasElement.querySelectorAll('button')) {
      const section = button.closest('section')!;
      await expect(
        Math.abs(button.getBoundingClientRect().width - section.getBoundingClientRect().width),
      ).toBeLessThan(1);
      await expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
      await expect(button.scrollHeight).toBeLessThanOrEqual(button.clientHeight);
    }
  },
};
