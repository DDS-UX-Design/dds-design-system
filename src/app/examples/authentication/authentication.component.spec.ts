import { TestBed } from '@angular/core/testing';
import { AuthenticationComponent, AuthenticationPreview } from './authentication.component';

describe('Authentication template', () => {
  afterEach(() => vi.useRealTimers());
  async function setup(initialState: AuthenticationPreview = 'sign-in') {
    await TestBed.configureTestingModule({
      imports: [AuthenticationComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(AuthenticationComponent);
    fixture.componentRef.setInput('initialState', initialState);
    fixture.detectChanges();
    return fixture;
  }

  it('validates credentials inline and focuses the first invalid field without starting a request', async () => {
    const fixture = await setup();
    const page = fixture.componentInstance;
    page.signIn();
    fixture.detectChanges();
    expect(page.busy()).toBe(false);
    expect(page.identifierError).toBe('Enter your email or mobile number.');
    expect(page.passwordError).toBe('Enter your password.');
    expect(document.activeElement?.getAttribute('autocomplete')).toBe('username');
    expect(fixture.nativeElement.querySelectorAll('input[aria-invalid=true]')).toHaveLength(2);
    page.updateIdentifier('alex@invalid');
    page.updatePassword('a valid existing password');
    page.signIn();
    expect(page.identifierError).toContain('valid email');
  });

  it('locks controls and prevents duplicate sign-in and early verification while a request is pending', async () => {
    vi.useFakeTimers();
    const fixture = await setup();
    const page = fixture.componentInstance;
    const root: HTMLElement = fixture.nativeElement;
    const username = root.querySelector<HTMLInputElement>('input[autocomplete=username]')!;
    const password = root.querySelector<HTMLInputElement>('input[autocomplete=current-password]')!;
    username.value = 'alex@example.com';
    username.dispatchEvent(new Event('input', { bubbles: true }));
    password.value = 'any existing password';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    const submit = new Event('submit', { bubbles: true, cancelable: true });
    root.querySelector('form')!.dispatchEvent(submit);
    expect(submit.defaultPrevented).toBe(true);
    page.signIn();
    page.verify();
    fixture.detectChanges();
    expect(page.busy()).toBe(true);
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain(
      'Signing in',
    );
    vi.advanceTimersByTime(700);
    fixture.detectChanges();
    expect(page.stage()).toBe('verification');
    expect(page.password).toBe('');
    expect(page.remaining()).toBe(180);
    expect(document.activeElement?.tagName).toBe('H1');
    expect(fixture.nativeElement.querySelector('input[autocomplete=one-time-code]')).not.toBeNull();
  });

  it('accepts international mobile identifiers and masks the destination', async () => {
    vi.useFakeTimers();
    const fixture = await setup();
    const page = fixture.componentInstance;
    page.identifier = '+254 712 345 678';
    page.password = 'password';
    page.signIn();
    vi.advanceTimersByTime(700);
    expect(page.stage()).toBe('verification');
    expect(page.maskedIdentifier).toBe('•••• 5678');
    expect(fixture.nativeElement.textContent).not.toContain('+254 712 345 678');
  });

  it('shows a generic credentials error and permits retry with the same identifier', async () => {
    vi.useFakeTimers();
    const fixture = await setup();
    const page = fixture.componentInstance;
    page.identifier = 'alex@example.com';
    page.password = 'password';
    page.failure = 'credentials';
    page.signIn();
    vi.advanceTimersByTime(700);
    fixture.detectChanges();
    expect(page.stage()).toBe('sign-in');
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('incorrect');
    expect(page.identifier).toBe('alex@example.com');
    page.failure = 'none';
    page.signIn();
    vi.advanceTimersByTime(700);
    expect(page.stage()).toBe('verification');
  });

  it('requires explicit verification, preserves invalid-code recovery and succeeds only after verification', async () => {
    vi.useFakeTimers();
    const fixture = await setup('verification');
    const page = fixture.componentInstance;
    page.updateCode('000000');
    expect(page.stage()).toBe('verification');
    page.verify();
    vi.advanceTimersByTime(700);
    expect(page.codeError).toContain('incorrect');
    page.updateCode('123456');
    expect(page.codeError).toBe('');
    expect(page.stage()).toBe('verification');
    page.verify();
    vi.advanceTimersByTime(700);
    fixture.detectChanges();
    expect(page.stage()).toBe('success');
    expect(page.code).toBe('');
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('You’re signed in');
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain(
      'identity is verified',
    );
  });

  it('rejects codes that expire during the request, including when the countdown has not ticked yet', async () => {
    vi.useFakeTimers();
    const fixture = await setup('verification');
    const page = fixture.componentInstance;
    page.updateCode('123456');
    vi.setSystemTime(Date.now() + 179500);
    page.verify();
    vi.advanceTimersByTime(700);
    expect(page.stage()).toBe('verification');
    expect(page.codeError).toContain('expired');
    expect(page.remaining()).toBe(0);
  });

  it('enforces resend cooldown, preserves the challenge on send failure and resets after a successful resend', async () => {
    vi.useFakeTimers();
    const fixture = await setup('verification');
    const page = fixture.componentInstance;
    page.resend();
    expect(page.busy()).toBe(false);
    vi.advanceTimersByTime(30000);
    page.failure = 'resend';
    page.resend();
    vi.advanceTimersByTime(700);
    expect(page.error()).toContain('couldn’t send');
    expect(page.remaining()).toBeLessThan(180);
    page.failure = 'none';
    page.resend();
    vi.advanceTimersByTime(700);
    expect(page.remaining()).toBe(180);
    expect(page.resendRemaining()).toBe(30);
    expect(page.notice()).toContain('new verification code');
    expect(document.activeElement?.getAttribute('autocomplete')).toBe('one-time-code');
  });

  it('handles verification service errors without claiming success and allows retry', async () => {
    vi.useFakeTimers();
    const fixture = await setup('verification');
    const page = fixture.componentInstance;
    page.code = '123456';
    page.failure = 'verification';
    page.verify();
    vi.advanceTimersByTime(700);
    expect(page.stage()).toBe('verification');
    expect(page.error()).toContain('couldn’t verify');
    page.failure = 'none';
    page.verify();
    vi.advanceTimersByTime(700);
    expect(page.stage()).toBe('success');
  });

  it('validates password recovery, supports retry and uses a non-enumerating confirmation', async () => {
    vi.useFakeTimers();
    const fixture = await setup();
    const page = fixture.componentInstance;
    page.identifier = 'alex@example.com';
    page.password = 'password';
    page.forgotPassword();
    expect(page.password).toBe('');
    expect(page.recoveryEmail).toBe('alex@example.com');
    page.recoveryEmail = 'invalid';
    page.recover();
    expect(page.recoveryError).toContain('valid email');
    page.recoveryEmail = 'unknown@example.com';
    page.failure = 'recovery';
    page.recover();
    vi.advanceTimersByTime(700);
    expect(page.stage()).toBe('recovery');
    expect(page.error()).toContain('couldn’t send');
    page.failure = 'none';
    page.recover();
    vi.advanceTimersByTime(700);
    fixture.detectChanges();
    expect(page.stage()).toBe('recovery-sent');
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain(
      'If an account exists',
    );
    page.backToSignIn();
    expect(page.stage()).toBe('sign-in');
    expect(page.password).toBe('');
  });

  it('cleans up pending requests and expiry timers on destruction', async () => {
    vi.useFakeTimers();
    const fixture = await setup('verification');
    const page = fixture.componentInstance;
    page.code = '123456';
    page.verify();
    fixture.destroy();
    vi.advanceTimersByTime(200000);
    expect(page.stage()).toBe('verification');
    expect(page.remaining()).toBe(180);
  });
});
