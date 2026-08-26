import { addons } from 'storybook/manager-api';
import { ddsTheme } from './dds-theme';

addons.setConfig({
  theme: ddsTheme,
});
