import type { Meta, StoryObj } from '@storybook/angular';
import { TypographyPageComponent } from '../app/typography-page.component';

const meta: Meta<TypographyPageComponent> = {
  title: 'Pages/Typography',
  component: TypographyPageComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'The typography page showcasing the design system’s heading and text patterns.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<TypographyPageComponent>;

export const Default: Story = {};
