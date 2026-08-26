import { create } from 'storybook/theming/create';

// Storybook addons perform JavaScript color calculations on theme values and
// therefore require a resolved color rather than a CSS custom-property string.
// This is the resolved value of the DDS token --bg-colour-accent-dark.
const accentDark = '#262626';

export const ddsTheme = create({
  base: 'dark',

  brandTitle: 'DDS Design System v1.0.0',
  brandUrl: '/',
  brandTarget: '_self',

  fontBase: 'Inter, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  colorPrimary: '#82a6dd',
  colorSecondary: '#82a6dd',

  appBg: accentDark,
  appContentBg: accentDark,
  appPreviewBg: '#ffffff',
  appBorderColor: '#404040',
  appBorderRadius: 4,

  textColor: '#ffffff',
  textInverseColor: '#171717',

  barBg: accentDark,
  barTextColor: '#d4d4d4',
  barSelectedColor: '#ffffff',
  barHoverColor: '#ffffff',

  inputBg: '#ffffff',
  inputBorder: '#737373',
  inputTextColor: '#171717',
  inputBorderRadius: 4,
});
