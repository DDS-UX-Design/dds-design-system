import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { TextInputComponent } from '../app/components/text-input/text-input.component';
import { TextareaComponent } from '../app/components/textarea/textarea.component';
import { PasswordInputComponent } from '../app/components/password-input/password-input.component';
import { SearchComponent } from '../app/components/search/search.component';
import { OtpInputComponent } from '../app/components/otp-input/otp-input.component';

const meta: Meta = {
  title: 'Components/Forms/Text Entry Semantic Colours',
  decorators: [
    moduleMetadata({
      imports: [
        TextInputComponent,
        TextareaComponent,
        PasswordInputComponent,
        SearchComponent,
        OtpInputComponent,
      ],
    }),
  ],
  parameters: { layout: 'fullscreen' },
};
export default meta;

const matrix = (theme: string) => `
<section data-theme="${theme}" style="padding:24px;background:var(--color-bg-default);color:var(--color-text-primary)">
  <h2>${theme === 'dark' ? 'Dark' : 'Light'} text entry</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;align-items:start">
    <dds-text-input label="Customer name" helperText="Use the name shown on the account." />
    <dds-text-input label="Billing contact" state="focused" value="Amina Otieno" />
    <dds-text-input label="Account reference" state="error" errorMessage="Enter the reference from your latest invoice. Contact support if you cannot find it." />
    <dds-text-input label="Managed account" state="focused" [disabled]="true" value="Assigned by your organisation" />
    <dds-textarea label="Delivery instructions" value="Please call reception on arrival. Deliver to the loading bay behind the main building." helperText="Include access details and a contact number." />
    <dds-textarea label="Reason for cancellation" state="error" errorMessage="Explain why this order needs to be cancelled." />
    <dds-textarea label="Archived notes" state="disabled" value="This order has been archived." />
    <dds-password-input label="New password" state="focused" />
    <dds-password-input label="Confirm password" state="error" errorMessage="Passwords must match." />
    <dds-password-input label="Managed password" state="error" [disabled]="true" />
    <dds-search label="Search customers" [expanded]="true" [suggestions]="['Amina Otieno — Nairobi distribution centre', 'Daniel Mwangi — Mombasa']" />
    <dds-otp-input [showLabel]="true" label="Verification code" state="focused" value="12" />
    <dds-otp-input [showLabel]="true" label="Expired code" state="error" [codeExpired]="true" />
    <dds-otp-input [showLabel]="true" label="Verification unavailable" state="disabled-loading" />
  </div>
</section>`;

/** Compare resolved browser colours with the semantic role in the same theme scope. */
async function semanticColour(element: Element, property: string, token: string) {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  element.appendChild(probe);
  const expected = getComputedStyle(probe).color;
  probe.remove();
  await expect(getComputedStyle(element).getPropertyValue(property)).toBe(expected);
}

const verify = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const name = canvas.getByRole('textbox', { name: 'Customer name' });
  await semanticColour(name, 'color', '--color-text-primary');
  await semanticColour(name.parentElement!, 'background-color', '--color-bg-elevated');
  await userEvent.click(name);
  await semanticColour(name.parentElement!, 'border-top-color', '--color-border-focus');
  const invalid = canvas.getByRole('textbox', { name: 'Account reference' });
  await userEvent.click(invalid);
  await semanticColour(invalid.parentElement!, 'border-top-color', '--color-feedback-error');
  await semanticColour(
    canvasElement.querySelector('.dds-text-input__message--error')!,
    'color',
    '--color-feedback-error',
  );
  const disabled = canvas.getByRole('textbox', { name: 'Managed account' });
  await expect(disabled).toBeDisabled();
  await semanticColour(disabled.parentElement!, 'border-top-color', '--color-border-default');
  await semanticColour(disabled, 'color', '--color-text-disabled');
  const buttons = canvas.getAllByRole('button');
  await expect(buttons.at(-1)!).toBeDisabled();
  const search = canvas.getByRole('combobox', { name: 'Search customers' });
  await userEvent.click(search);
  await userEvent.keyboard('{ArrowDown}');
  await semanticColour(canvas.getAllByRole('option')[0], 'background-color', '--color-bg-subtle');
  await userEvent.keyboard('{Enter}');
  await expect(search).toHaveValue('Amina Otieno — Nairobi distribution centre');
};

type Story = StoryObj;
export const Light: Story = { render: () => ({ template: matrix('light') }), play: verify };
export const Dark: Story = { render: () => ({ template: matrix('dark') }), play: verify };
export const Comparison: Story = { render: () => ({ template: matrix('light') + matrix('dark') }) };
