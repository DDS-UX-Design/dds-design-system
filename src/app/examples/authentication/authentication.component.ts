import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  inject,
  signal,
} from '@angular/core';
import { AlertComponent } from '../../components/alert/alert.component';
import { ButtonComponent } from '../../components/button/button.component';
import { CheckboxComponent } from '../../components/checkbox/checkbox.component';
import { TextInputComponent } from '../../components/text-input/text-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { OtpInputComponent } from '../../components/otp-input/otp-input.component';

export type AuthenticationPreview =
  | 'sign-in'
  | 'credentials-error'
  | 'verification'
  | 'invalid-code'
  | 'expired-code'
  | 'success'
  | 'recovery';
export type AuthenticationFailure =
  'none' | 'credentials' | 'service' | 'verification' | 'resend' | 'recovery';
type Stage = 'sign-in' | 'verification' | 'success' | 'recovery' | 'recovery-sent';
let authenticationId = 0;

/** Interactive template only. All requests are simulated; no credentials are sent or persisted. */
@Component({
  selector: 'dds-authentication-template',
  standalone: true,
  imports: [
    AlertComponent,
    ButtonComponent,
    CheckboxComponent,
    TextInputComponent,
    PasswordInputComponent,
    OtpInputComponent,
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css',
})
export class AuthenticationComponent implements OnInit, OnDestroy {
  @Input() initialState: AuthenticationPreview = 'sign-in';
  @Input() initialIdentifier = '';
  @Input() failure: AuthenticationFailure = 'none';
  @Input() requestDelay = 700;
  @Input() codeLifetime = 180;
  @Input() resendDelay = 30;

  @ViewChild('heading') private heading?: ElementRef<HTMLElement>;
  private readonly root = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly id = `dds-authentication-${authenticationId++}`;
  readonly stage = signal<Stage>('sign-in');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly remaining = signal(180);
  readonly resendRemaining = signal(0);
  identifier = '';
  password = '';
  keepSignedIn = false;
  code = '';
  recoveryEmail = '';
  identifierError = '';
  passwordError = '';
  codeError = '';
  recoveryError = '';
  private deadline = 0;
  private resendDeadline = 0;
  private request?: ReturnType<typeof setTimeout>;
  private ticker?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.identifier = this.initialIdentifier;
    if (this.initialState !== 'sign-in') this.identifier ||= 'alex.morgan@example.com';
    if (this.initialState === 'credentials-error')
      this.error.set('The email, mobile number or password is incorrect. Please try again.');
    else if (['verification', 'invalid-code', 'expired-code'].includes(this.initialState)) {
      this.stage.set('verification');
      this.issueCode();
      if (this.initialState === 'invalid-code') {
        this.code = '000000';
        this.codeError = 'That code is incorrect. Check the code and try again.';
      } else if (this.initialState === 'expired-code') {
        this.deadline = Date.now();
        this.resendDeadline = Date.now();
        this.tick();
      }
    } else if (this.initialState === 'success') this.stage.set('success');
    else if (this.initialState === 'recovery') this.stage.set('recovery');
  }

  ngOnDestroy(): void {
    clearTimeout(this.request);
    clearInterval(this.ticker);
  }

  get headingText(): string {
    return {
      'sign-in': 'Sign in',
      verification: 'Verify your identity',
      success: 'You’re signed in',
      recovery: 'Reset your password',
      'recovery-sent': 'Check your inbox',
    }[this.stage()];
  }

  get expiryTime(): string {
    return `${Math.floor(this.remaining() / 60)
      .toString()
      .padStart(2, '0')}:${(this.remaining() % 60).toString().padStart(2, '0')}`;
  }

  get maskedIdentifier(): string {
    const [user, domain] = this.identifier.trim().split('@');
    return domain
      ? `${user.slice(0, 1)}••••@${domain}`
      : `•••• ${this.identifier.replace(/\D/g, '').slice(-4)}`;
  }

  updateIdentifier(value: string): void {
    this.identifier = value;
    this.identifierError = '';
    this.error.set('');
  }
  updatePassword(value: string): void {
    this.password = value;
    this.passwordError = '';
    this.error.set('');
  }
  updateCode(value: string): void {
    this.code = value;
    if (this.remaining() > 0) this.codeError = '';
    this.error.set('');
  }

  signIn(): void {
    if (this.busy() || this.stage() !== 'sign-in') return;
    const identifier = this.identifier.trim();
    const phone = identifier.replace(/[\s()-]/g, '');
    this.identifierError = !identifier
      ? 'Enter your email or mobile number.'
      : this.validEmail(identifier) || /^\+?\d{7,15}$/.test(phone)
        ? ''
        : 'Enter a valid email or mobile number.';
    this.passwordError = this.password ? '' : 'Enter your password.';
    if (this.identifierError || this.passwordError) {
      this.focusInvalid();
      return;
    }
    this.identifier = identifier;
    this.runRequest(() => {
      if (this.failure === 'credentials')
        this.error.set('The email, mobile number or password is incorrect. Please try again.');
      else if (this.failure === 'service')
        this.error.set('We couldn’t sign you in right now. Please try again.');
      else {
        this.password = '';
        this.issueCode();
        this.moveTo('verification');
      }
    });
  }

  verify(): void {
    if (this.busy() || this.stage() !== 'verification') return;
    this.tick();
    if (this.remaining() === 0) return;
    if (!/^\d{6}$/.test(this.code)) {
      this.codeError = 'Enter the complete six-digit code.';
      this.focusInvalid();
      return;
    }
    this.runRequest(() => {
      this.tick();
      if (this.remaining() === 0) return;
      if (this.failure === 'verification' || this.failure === 'service')
        this.error.set('We couldn’t verify the code right now. Please try again.');
      else if (this.code !== '123456') {
        this.codeError = 'That code is incorrect. Check the code and try again.';
        this.focusInvalid();
      } else {
        this.code = '';
        clearInterval(this.ticker);
        this.moveTo('success');
      }
    });
  }

  resend(): void {
    if (this.busy() || this.stage() !== 'verification' || this.resendRemaining() > 0) return;
    this.runRequest(() => {
      if (this.failure === 'resend' || this.failure === 'service')
        this.error.set('We couldn’t send a new code. Please try again.');
      else {
        this.issueCode();
        this.notice.set('A new verification code has been sent.');
        this.focusCode();
      }
    });
  }

  recover(): void {
    if (this.busy() || this.stage() !== 'recovery') return;
    this.recoveryError = this.validEmail(this.recoveryEmail.trim())
      ? ''
      : 'Enter a valid email address.';
    if (this.recoveryError) {
      this.focusInvalid();
      return;
    }
    this.runRequest(() => {
      if (this.failure === 'recovery' || this.failure === 'service')
        this.error.set('We couldn’t send the reset instructions. Please try again.');
      else this.moveTo('recovery-sent');
    });
  }

  forgotPassword(): void {
    if (this.busy()) return;
    this.password = '';
    this.recoveryEmail = this.validEmail(this.identifier.trim()) ? this.identifier.trim() : '';
    this.recoveryError = '';
    this.moveTo('recovery');
  }

  backToSignIn(): void {
    if (this.busy()) return;
    clearInterval(this.ticker);
    this.password = '';
    this.code = '';
    this.codeError = '';
    this.passwordError = '';
    this.identifierError = '';
    this.keepSignedIn = false;
    this.moveTo('sign-in');
  }

  private validEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private issueCode(): void {
    clearInterval(this.ticker);
    this.code = '';
    this.codeError = '';
    this.deadline = Date.now() + Math.max(1, this.codeLifetime) * 1000;
    this.resendDeadline = Date.now() + Math.max(0, this.resendDelay) * 1000;
    this.remaining.set(Math.max(1, this.codeLifetime));
    this.resendRemaining.set(Math.max(0, this.resendDelay));
    this.ticker = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    this.remaining.set(Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000)));
    this.resendRemaining.set(Math.max(0, Math.ceil((this.resendDeadline - Date.now()) / 1000)));
    if (this.remaining() === 0) {
      this.codeError = 'This code has expired. Request a new code to continue.';
      this.notice.set('');
      if (this.resendRemaining() === 0) clearInterval(this.ticker);
    }
    this.cdr.markForCheck();
  }

  private runRequest(done: () => void): void {
    this.error.set('');
    this.notice.set('');
    this.busy.set(true);
    this.request = setTimeout(
      () => {
        this.request = undefined;
        this.busy.set(false);
        done();
        this.cdr.markForCheck();
      },
      Math.max(0, this.requestDelay),
    );
  }

  private moveTo(stage: Stage): void {
    this.error.set('');
    this.notice.set('');
    this.stage.set(stage);
    this.cdr.detectChanges();
    this.heading?.nativeElement.focus();
  }

  private focusInvalid(): void {
    this.cdr.detectChanges();
    this.root.nativeElement.querySelector<HTMLElement>('input[aria-invalid="true"]')?.focus();
  }

  private focusCode(): void {
    this.cdr.detectChanges();
    this.root.nativeElement.querySelector<HTMLInputElement>('dds-otp-input input')?.focus();
  }
}
