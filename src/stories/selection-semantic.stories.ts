import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { CheckboxComponent } from '../app/components/checkbox/checkbox.component';
import { RadioComponent } from '../app/components/radio/radio.component';
import { CheckboxGroupComponent } from '../app/components/checkbox-group/checkbox-group.component';
import { RadioGroupComponent } from '../app/components/radio-group/radio-group.component';
import { SelectComponent } from '../app/components/select/select.component';
import { DateInputComponent } from '../app/components/date-input/date-input.component';

export default {
  title: 'Components/Forms/Selection Semantic Colours',
  decorators: [
    moduleMetadata({
      imports: [
        CheckboxComponent,
        RadioComponent,
        CheckboxGroupComponent,
        RadioGroupComponent,
        SelectComponent,
        DateInputComponent,
      ],
    }),
  ],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
const matrix = (theme: string) => `
<section data-theme="${theme}" style="padding:24px;background:var(--color-bg-default);color:var(--color-text-primary)">
<h2>${theme} selection and dates</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px">
<dds-checkbox label="Notifications" option="Send delivery updates" value="checked" />
<dds-checkbox label="Recipients" option="Some recipients selected" value="indeterminate" state="focused" />
<dds-checkbox label="Terms" option="I accept the delivery terms" state="invalid" />
<dds-checkbox label="Archived preference" option="Email updates" value="checked" state="disabled" />
<dds-radio label="Delivery" option="Standard delivery" [checked]="true" />
<dds-radio label="Delivery preview" option="Express delivery" state="focused" />
<dds-radio label="Delivery required" option="Collect from depot" state="invalid" />
<dds-radio label="Unavailable service" option="Same day delivery" [checked]="true" state="disabled" />
<dds-checkbox-group label="Destinations" [options]="[{label:'Nairobi distribution centre',value:'nairobi'},{label:'Mombasa distribution centre',value:'mombasa'}]" state="invalid" errorMessage="Choose at least one destination for this shipment." />
<dds-radio-group label="Billing schedule" [options]="[{label:'Monthly',value:'monthly'},{label:'Quarterly',value:'quarterly'}]" state="disabled" />
<dds-select label="Warehouse" [options]="[{label:'Nairobi',value:'nairobi'},{label:'Mombasa (unavailable)',value:'mombasa',disabled:true}]" />
<dds-select label="Dispatch priority" state="error" errorMessage="Choose a priority before submitting this order." />
<dds-select label="Managed warehouse" state="disabled" />
<dds-date-input label="Delivery date" state="focused" />
<dds-date-input label="Invoice date" state="error" errorMessage="Use DD/MM/YYYY and choose a date after the order was placed." />
<dds-date-input label="Archived date" state="error" [disabled]="true" value="24/10/2026" />
</div></section>`;
type Story = StoryObj;
export const Light: Story = { render: () => ({ template: matrix('light') }) };
export const Dark: Story = { render: () => ({ template: matrix('dark') }) };
export const Comparison: Story = { render: () => ({ template: matrix('light') + matrix('dark') }) };
