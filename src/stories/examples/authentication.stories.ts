import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AuthenticationComponent } from '../../app/examples/authentication/authentication.component';

const meta: Meta<AuthenticationComponent> = {
  title: 'Templates/Authentication',
  component: AuthenticationComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A complete front-end example: sign in → verification → success, with field validation, request errors, expiry, resend and password recovery. Requests are simulated; credentials and the “Keep me signed in” preference are never sent or persisted. Use any valid email/international mobile number and a non-empty password, then code **123456**. Production applications must supply server authentication, code delivery/validation, rate limits, secure sessions, password reset links and navigation. Controls simulate failures without exposing test switches in the template. Inspired by the [earlier client flow](https://www.figma.com/design/OEgzuPimehJo7iClp0Ntvf?node-id=26-1104), composed with current DDS controls and a generic local image. Responsive stacking and the reset-request screen are template adaptations, not verified Figma variants. The image is omitted below 960px of container width; below 540px the card padding and heading shrink. Inherit Light/Dark from a data-theme ancestor.',
      },
    },
  },
  args: {
    initialState: 'sign-in',
    initialIdentifier: '',
    failure: 'none',
    requestDelay: 700,
    codeLifetime: 180,
    resendDelay: 30,
  },
  argTypes: {
    initialState: {
      control: 'select',
      options: [
        'sign-in',
        'credentials-error',
        'verification',
        'invalid-code',
        'expired-code',
        'success',
        'recovery',
      ],
      description: 'Initial preview on mount. Remount the story to restart the journey.',
    },
    failure: {
      control: 'select',
      options: ['none', 'credentials', 'service', 'verification', 'resend', 'recovery'],
    },
    requestDelay: { control: { type: 'number', min: 0, max: 5000, step: 100 } },
    codeLifetime: { control: { type: 'number', min: 1, max: 600 } },
    resendDelay: { control: { type: 'number', min: 0, max: 60 } },
  },
};
export default meta;
type Story = StoryObj<AuthenticationComponent>;

export const SignIn: Story = {};
export const ValidationAndSignIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    const username = canvas.getByRole('textbox', { name: /Email \/ mobile number/ });
    await expect(username).toHaveFocus();
    await expect(username).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(username, 'alex@example.com');
    await userEvent.type(
      canvas.getByLabelText('Password', { exact: false, selector: 'input' }),
      'Example password',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    await expect(canvas.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
    await waitFor(
      () => expect(canvas.getByRole('heading', { name: 'Verify your identity' })).toBeVisible(),
      { timeout: 5000 },
    );
    const code = canvas.getByLabelText('Verification code', { exact: false, selector: 'input' });
    await userEvent.type(code, '000000');
    await userEvent.click(canvas.getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(canvas.getByText(/That code is incorrect/)).toBeVisible());
    await userEvent.clear(code);
    await userEvent.type(code, '123456');
    await expect(canvas.getByRole('heading', { name: 'Verify your identity' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Verify' }));
    await waitFor(
      () => expect(canvas.getByRole('heading', { name: 'You’re signed in' })).toHaveFocus(),
      { timeout: 5000 },
    );
  },
};
export const CredentialsError: Story = {
  args: { initialState: 'credentials-error', failure: 'credentials' },
};
export const Verification: Story = { args: { initialState: 'verification' } };
export const ExpiredCodeAndResend: Story = {
  args: { initialState: 'expired-code' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Code expired', { exact: true })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Verify' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Resend code' }));
    await waitFor(
      () => expect(canvas.getByText('A new verification code has been sent.')).toBeVisible(),
      { timeout: 5000 },
    );
    await expect(
      canvas.getByLabelText('Verification code', { exact: false, selector: 'input' }),
    ).toHaveFocus();
    await expect(canvas.getByRole('button', { name: /Resend code in/ })).toBeDisabled();
  },
};
export const Success: Story = { args: { initialState: 'success' } };
export const PasswordRecovery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Forgot password?' }));
    await userEvent.type(
      canvas.getByRole('textbox', { name: /Email address/ }),
      'alex@example.com',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Send reset instructions' }));
    await waitFor(
      () => expect(canvas.getByRole('heading', { name: 'Check your inbox' })).toHaveFocus(),
      { timeout: 5000 },
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('If an account exists');
  },
};
export const Dark: Story = {
  render: (args) => ({
    props: args,
    template: `<div data-theme="dark"><dds-authentication-template [initialState]="initialState" [initialIdentifier]="initialIdentifier" [failure]="failure" [requestDelay]="requestDelay" [codeLifetime]="codeLifetime" [resendDelay]="resendDelay" /></div>`,
  }),
};
export const Narrow: Story = {
  render: () => ({
    template: `<div style="width:360px;max-width:100%;margin:auto"><dds-authentication-template initialState="verification" /></div>`,
  }),
};
