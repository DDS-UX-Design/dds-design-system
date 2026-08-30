import type { Meta, StoryObj } from '@storybook/angular';
import {
  LoadingOverlayComponent,
  LoadingOverlayPlatform,
  LoadingOverlayTheme,
} from '../app/components/loading-overlay/loading-overlay.component';

type LoadingOverlayStoryArgs = {
  theme: LoadingOverlayTheme;
  platform: LoadingOverlayPlatform;
  label: string;
};

const meta: Meta<LoadingOverlayStoryArgs> = {
  title: 'Components/Loading/Spinner Applications',
  component: LoadingOverlayComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A blocking loading overlay based on the web and mobile application frames. Place it inside a positioned application region. Web supports light and dark overlays; Mobile uses the specified 80%-white light overlay.',
      },
    },
  },
  argTypes: {
    theme: { control: 'radio', options: ['light', 'dark'], table: { category: 'Appearance' } },
    platform: { control: 'radio', options: ['web', 'mobile'], table: { category: 'Layout' } },
    label: { control: 'text', table: { category: 'Accessibility' } },
  },
  args: { theme: 'light', platform: 'web', label: 'Loading application' },
  render: (args) => ({
    props: args,
    template: `
      <div
        style="position:relative; min-height:520px; height:100vh; overflow:hidden; background:linear-gradient(135deg, #f0f4fa, #fff)"
        [style.max-width]="platform === 'mobile' ? '360px' : null"
        [style.margin]="platform === 'mobile' ? '0 auto' : null"
      >
        <div style="padding:32px; font:16px Inter, sans-serif; color:#1a223b">
          <h1 style="margin-top:0">Application content</h1>
          <p>The overlay blocks this region while an operation completes.</p>
        </div>
        <dds-loading-overlay [theme]="theme" [platform]="platform" [label]="label"></dds-loading-overlay>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<LoadingOverlayStoryArgs>;

export const WebLight: Story = {};
export const WebDark: Story = { args: { theme: 'dark' } };
export const Mobile: Story = {
  args: { platform: 'mobile' },
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
