import type { Meta, StoryObj } from '@storybook/angular';
import { TypographyPageComponent } from '../app/typography-page.component';

const meta: Meta<TypographyPageComponent> = {
  title: 'Foundations/Typography',
  component: TypographyPageComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The DDS type scale establishes hierarchy and readable rhythm across product experiences. Use display and heading styles sparingly for structure, body styles for primary content, and captions for supporting metadata—not essential instructions.',
      },
    },
    layout: 'fullscreen',
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj<TypographyPageComponent>;

export const TypeScale: Story = {
  name: 'Type scale',
};
