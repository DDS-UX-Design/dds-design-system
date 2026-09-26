import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { create } from 'storybook/theming/create';
import docJson from '../documentation.json';
import { ddsTheme } from './dds-theme';

setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    a11y: {
      test: 'error',
    },
    backgrounds: {
      options: {
        light: { name: 'Light', value: '#ffffff' },
        subtle: { name: 'Subtle', value: '#f7f7f7' },
        dark: { name: 'Dark', value: '#171717' },
      },
    },
    controls: {
      expanded: true,
      sort: 'requiredFirst',
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
      theme: create({ base: 'light', fontBase: ddsTheme.fontBase, fontCode: ddsTheme.fontCode }),
    },
    options: {
      storySort: {
        order: [
          'Welcome',
          'Foundations',
          ['Colours', 'Typography', 'Spacing', 'Icons', 'Accessibility'],
          'Components',
          'Patterns',
          'Layouts',
          'Pages',
          'Project',
        ],
      },
    },
    viewport: {
      options: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
    },
  },
};

export default preview;
