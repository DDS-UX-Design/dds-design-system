import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { ChartComponent } from '../app/components/chart/chart.component';

const categoryLabels = [
  'Category 1',
  'Category 2',
  'Category 3',
  'Category 4',
  'Category 5',
  'Category 6',
];

const meta: Meta<ChartComponent> = {
  title: 'Experimental/Data Visualisation/Charts',
  component: ChartComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="width: min(720px, 90vw); padding: 24px">${story}</div>`,
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Experimental Chart.js examples that document DDS chart colour usage. Use colours in sequence and do not assign semantic meaning to a chart colour unless the surrounding content explains it.',
      },
    },
  },
  args: {
    type: 'donut',
    labels: ['Series 1', 'Series 2', 'Series 3'],
    series: [{ label: 'Share', data: [75, 15, 10] }],
    legendPosition: 'right',
    accessibleLabel: 'Series 1: 75 percent, Series 2: 15 percent, Series 3: 10 percent',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['donut', 'pie', 'gauge', 'line', 'horizontal-bar', 'grouped-bar', 'stacked-bar'],
    },
    legendPosition: { control: 'radio', options: ['right', 'bottom', 'top'] },
  },
};

export default meta;
type Story = StoryObj<ChartComponent>;

export const Donut: Story = {
  parameters: {
    docs: {
      description: { story: 'Uses chart colours 1–3 in order, matching the Figma reference.' },
    },
  },
};

export const Pie: Story = {
  args: { type: 'pie', legendPosition: 'bottom' },
};

export const Gauge: Story = {
  args: {
    type: 'gauge',
    labels: ['Completed', 'Remaining'],
    series: [{ label: 'Completion', data: [72, 28] }],
    accessibleLabel: 'Completion gauge: 72 percent.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use a gauge for progress toward a known maximum. Supply the completed value first and the remaining value second.',
      },
    },
  },
};

export const Line: Story = {
  args: {
    type: 'line',
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { label: 'Current period', data: [42, 58, 51, 73, 68, 84] },
      { label: 'Previous period', data: [35, 44, 48, 55, 61, 66] },
    ],
    legendPosition: 'bottom',
    accessibleLabel:
      'Line chart comparing the current and previous periods from January to June. Current period ends at 84; previous period ends at 66.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use line charts to show change over an ordered interval. Keep each series colour consistent across related views.',
      },
    },
  },
};

export const HorizontalBar: Story = {
  args: {
    type: 'horizontal-bar',
    labels: categoryLabels,
    series: [{ label: 'Value', data: [1500, 1200, 1020, 880, 700, 510] }],
    accessibleLabel:
      'Horizontal bar chart. Category values are 1500, 1200, 1020, 880, 700, and 510.',
  },
  parameters: {
    docs: {
      description: {
        story: 'A single series may use the full palette when colour helps distinguish categories.',
      },
    },
  },
};

const groupedSeries = [
  { label: 'Series 1', data: [1280, 1280, 1280, 1280, 1280, 1280] },
  { label: 'Series 2', data: [510, 510, 510, 510, 510, 510] },
];

export const GroupedHorizontalBar: Story = {
  args: {
    type: 'grouped-bar',
    labels: categoryLabels,
    series: groupedSeries,
    legendPosition: 'bottom',
    accessibleLabel:
      'Grouped horizontal bar chart comparing Series 1 and Series 2 across six categories.',
  },
};

export const StackedHorizontalBar: Story = {
  args: {
    type: 'stacked-bar',
    labels: categoryLabels,
    series: [
      { label: 'Series 1', data: [300, 260, 260, 260, 260, 260] },
      { label: 'Series 2', data: [300, 260, 260, 260, 260, 260] },
      { label: 'Series 3', data: [300, 260, 260, 260, 260, 260] },
      { label: 'Series 4', data: [300, 260, 260, 260, 260, 260] },
      { label: 'Series 5', data: [300, 260, 260, 260, 260, 260] },
    ],
    legendPosition: 'bottom',
    accessibleLabel: 'Stacked horizontal bar chart with five series across six categories.',
  },
};

export const ColourSequence: Story = {
  args: {
    type: 'horizontal-bar',
    labels: ['Chart 1', 'Chart 2', 'Chart 3', 'Chart 4', 'Chart 5', 'Chart 6'],
    series: [{ label: 'Colour token', data: [100, 100, 100, 100, 100, 100] }],
    accessibleLabel: 'The six DDS chart colour tokens shown in sequence.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Start at chart 1 and add colours in numerical order. Keep the same colour-to-series mapping across related views.',
      },
    },
  },
};
