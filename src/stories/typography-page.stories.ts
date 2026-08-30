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
          'Inter is the DDS primary font. The typography foundation documents responsive heading styles alongside body and label styles for consistent hierarchy and readable rhythm across product experiences.',
      },
    },
    layout: 'fullscreen',
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj<TypographyPageComponent>;

export const Typography: Story = {
  name: 'Typography',
};
