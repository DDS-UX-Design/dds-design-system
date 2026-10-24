import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ChartComponent } from '../app/components/chart/chart.component';
export default {
  title: 'Components/Chart/Semantic Colours',
  decorators: [moduleMetadata({ imports: [ChartComponent] })],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
const matrix = (theme: string) => `
<section data-theme="${theme}" style="padding:24px;background:var(--color-bg-default);color:var(--color-text-primary)">
<h2>${theme} shipment charts</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px">
<dds-chart type="line" accessibleLabel="Delivered and delayed shipments over three months" [labels]="['August','September','October']" [series]="[{label:'Delivered',data:[120,145,180]},{label:'Delayed',data:[15,12,9]}]" />
<dds-chart type="donut" accessibleLabel="Shipment distribution by depot" [labels]="['Nairobi','Mombasa','Kisumu']" />
<dds-chart type="gauge" accessibleLabel="75 percent of shipments delivered" />
</div></section>`;
type Story = StoryObj;
export const Light: Story = { render: () => ({ template: matrix('light') }) };
export const Dark: Story = { render: () => ({ template: matrix('dark') }) };
export const Comparison: Story = { render: () => ({ template: matrix('light') + matrix('dark') }) };
