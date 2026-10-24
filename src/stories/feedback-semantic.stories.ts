import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { AlertComponent } from '../app/components/alert/alert.component';
import { ToastComponent } from '../app/components/toast/toast.component';
import { StatusBadgeComponent } from '../app/components/status-badge/status-badge.component';

export default {
  title: 'Components/Feedback Semantic Colours',
  decorators: [moduleMetadata({ imports: [AlertComponent, ToastComponent, StatusBadgeComponent] })],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
const matrix = (theme: string) => `
<section data-theme="${theme}" style="padding:24px;background:var(--color-bg-default);color:var(--color-text-primary)">
<h2>${theme} feedback</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px">
${(['info', 'success', 'warning', 'danger'] as const)
  .map(
    (tone) => `
<div style="display:grid;gap:16px">
<dds-alert tone="${tone}" text="${tone}: Your shipment details have changed. Review the delivery address and contact the warehouse before dispatch." [showAction]="true" actionLabel="Review" />
<dds-toast tone="${tone}" title="Shipment update" message="${tone}: Order DDS-2026-1042 needs your attention. Check the full delivery instructions before continuing." [autoDismiss]="false" />
<dds-status-badge tone="${tone}" text="${tone}" />
</div>`,
  )
  .join('')}
<dds-status-badge tone="neutral" text="Awaiting allocation" />
</div></section>`;
type Story = StoryObj;
export const Light: Story = { render: () => ({ template: matrix('light') }) };
export const Dark: Story = { render: () => ({ template: matrix('dark') }) };
export const Comparison: Story = { render: () => ({ template: matrix('light') + matrix('dark') }) };
