import type { Meta, StoryObj } from '@storybook/angular';
import manifest from '../tokens/generated/figma.tokens.json';

const meta: Meta = {
  title: 'Foundations/Semantic Tokens',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Generated from the reviewed Figma snapshot. These stories use the generated CSS directly. Existing component stories still use their legacy styling until separately migrated.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

function renderTheme(theme: 'light' | 'dark') {
  const colours = manifest.tokens.filter((token) => token.collection === 'Semantic Colours');
  return {
    template: `<section data-theme="${theme}" style="background:var(--color-bg-default);color:var(--color-text-primary);padding:var(--space-6);border-radius:var(--radius-lg)">
      <h1>DDS semantic tokens · ${theme}</h1>
      <p>Generated CSS from Figma · ${colours.length} semantic colours. This gallery previews token values; component migration is a separate step.</p>
      <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border-default);padding:var(--space-4);border-radius:var(--radius-md);margin-bottom:var(--space-6)">
        <strong>Inventory updated</strong><p style="color:var(--color-text-secondary)">Your stock changes have been saved.</p>
        <span style="display:inline-block;background:var(--color-interactive-default);color:var(--color-text-on-interactive);padding:var(--space-2) var(--space-4);border-radius:var(--radius-sm)">Token preview</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--space-4)">
        ${colours.map((token) => `<div style="border:1px solid var(--color-border-default);border-radius:var(--radius-md);padding:var(--space-3)"><div aria-hidden="true" style="height:48px;background:var(${token.css});border:1px solid var(--color-border-default);margin-bottom:var(--space-2)"></div><strong>${token.name}</strong><br><code>${token.css}</code></div>`).join('')}
      </div>
    </section>`,
  };
}
export const Light: Story = { render: () => renderTheme('light') };
export const Dark: Story = { render: () => renderTheme('dark') };
