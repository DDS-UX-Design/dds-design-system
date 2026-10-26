import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NavTabComponent } from '../app/components/nav-tab/nav-tab.component';
import { SidebarNavComponent } from '../app/components/sidebar-nav/sidebar-nav.component';
import { TopBarNavComponent } from '../app/components/top-bar-nav/top-bar-nav.component';
import { PageToolbarComponent } from '../app/components/page-toolbar/page-toolbar.component';
import { MinimalPaginationComponent } from '../app/components/minimal-pagination/minimal-pagination.component';
import { NumberedPaginationComponent } from '../app/components/numbered-pagination/numbered-pagination.component';
import { DataTableComponent } from '../app/components/data-table/data-table.component';
import { KpiCardComponent } from '../app/components/kpi-card/kpi-card.component';

export default {
  title: 'Foundations/Theme Comparisons/Data and Navigation',
  decorators: [
    moduleMetadata({
      imports: [
        NavTabComponent,
        SidebarNavComponent,
        TopBarNavComponent,
        PageToolbarComponent,
        MinimalPaginationComponent,
        NumberedPaginationComponent,
        DataTableComponent,
        KpiCardComponent,
      ],
    }),
  ],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
const matrix = (theme: string) => `
<section data-theme="${theme}" style="padding:24px;background:var(--color-bg-default);color:var(--color-text-primary)">
<h2>${theme} data and navigation</h2>
<dds-top-bar-nav title="Customer distribution operations" />
<dds-page-toolbar />
<dds-nav-tab [items]="[{value:'orders',label:'Orders',icon:'package'},{value:'customers',label:'Customers',icon:'users'},{value:'archive',label:'Archive unavailable',disabled:true}]" selectedValue="orders" />
<div style="display:flex;gap:24px;align-items:start;margin-block:24px">
<dds-sidebar-nav [items]="[{id:'orders',label:'Orders',icon:'package'},{id:'report',label:'Reports unavailable',icon:'file',disabled:true},{id:'archive',label:'Archive link unavailable',href:'#archive',disabled:true}]" activeItemId="orders" />
<div style="display:grid;gap:16px;flex:1;min-width:0">
<dds-kpi-card label="Orders delivered" value="1,842" trend="positive" trendText="8.2% vs last month" />
<dds-kpi-card label="Late deliveries" value="12" trend="negative" trendText="3 more than last week" />
<dds-kpi-card label="Awaiting dispatch" value="42" trend="neutral" trendText="Unchanged since yesterday" />
<dds-data-table caption="Customer deliveries" [selectable]="true" [columns]="[{key:'name',label:'Customer'},{key:'status',label:'Status',type:'status',statusTone:'success'}]" [rows]="[{id:1,name:'Amina Otieno — Nairobi distribution centre, reception loading bay',status:'Delivered'},{id:2,name:'Daniel Mwangi — Mombasa',status:'Delivered'}]" [selectedKeys]="[1]" [totalItems]="2" />
<dds-numbered-pagination [currentPage]="1" [totalPages]="5" />
<dds-minimal-pagination [currentPage]="1" [totalPages]="5" />
</div></div></section>`;
type Story = StoryObj;
export const Light: Story = { render: () => ({ template: matrix('light') }) };
export const Dark: Story = { render: () => ({ template: matrix('dark') }) };
export const Comparison: Story = { render: () => ({ template: matrix('light') + matrix('dark') }) };
