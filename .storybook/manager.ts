import { addons } from 'storybook/manager-api';
import { ddsTheme } from './dds-theme';

addons.setConfig({
  theme: ddsTheme,
  // Storybook 10.5 renders the built-in zoom popover without the ariaLabel
  // that will be required in Storybook 11. Hide it until the upstream tool is
  // updated so the manager console remains useful and warning-free.
  toolbar: {
    zoom: { hidden: true },
  },
});
