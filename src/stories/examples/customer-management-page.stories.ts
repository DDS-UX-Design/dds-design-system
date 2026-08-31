import type { Meta, StoryObj } from '@storybook/angular';
import { CustomerManagementPageComponent } from '../../app/examples/customer-management-page/customer-management-page.component';

const meta: Meta<CustomerManagementPageComponent> = {
  title: 'Examples/Customer Management',
  component: CustomerManagementPageComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A desktop dashboard example that combines sidebar and top-bar navigation, search and filtering controls, buttons, status badges, row selection, and pagination into one customer-management workflow.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<CustomerManagementPageComponent>;

export const Default: Story = {
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
};
