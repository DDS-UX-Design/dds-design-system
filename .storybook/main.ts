import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/angular',
  webpackFinal: async (config) => {
    config.module?.rules?.push({
      test: /\.(?:md|backlog)$/,
      type: 'asset/source',
    });

    return config;
  },
};
export default config;
