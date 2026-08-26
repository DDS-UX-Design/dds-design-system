import { create } from 'storybook/theming/create';

export const ddsTheme = create({
  base: 'dark',

  brandTitle: 'DDS Design System v1.0.0',
  brandUrl: '/',
  brandTarget: '_self',

  fontBase: 'Inter, system-ui, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
});
