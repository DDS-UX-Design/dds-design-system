import { TestBed } from '@angular/core/testing';
import { TextInputComponent } from './text-input.component';
import { TextareaComponent } from '../textarea/textarea.component';
import { PasswordInputComponent } from '../password-input/password-input.component';
import { OtpInputComponent } from '../otp-input/otp-input.component';

describe('Text entry native disabled behaviour', () => {
  for (const component of [
    TextInputComponent,
    TextareaComponent,
    PasswordInputComponent,
    OtpInputComponent,
  ]) {
    it(`${component.name} prevents native focus when disabled`, async () => {
      await TestBed.configureTestingModule({ imports: [component] }).compileComponents();
      const fixture = TestBed.createComponent(component as typeof TextInputComponent);
      if (component === TextareaComponent) fixture.componentRef.setInput('state', 'disabled');
      else if (component === OtpInputComponent)
        fixture.componentRef.setInput('state', 'disabled-loading');
      else {
        fixture.componentRef.setInput('disabled', true);
        fixture.componentRef.setInput('state', 'focused');
      }
      fixture.detectChanges();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input, textarea');
      input.focus();
      expect(input.disabled).toBe(true);
      expect(document.activeElement).not.toBe(input);
      if (component === OtpInputComponent) {
        const focus = vi.spyOn(input, 'focus');
        fixture.nativeElement.querySelector('.dds-otp__fields').click();
        expect(focus).not.toHaveBeenCalled();
      }
    });
  }

  it('does not reveal or emit for a disabled password visibility button', async () => {
    await TestBed.configureTestingModule({ imports: [PasswordInputComponent] }).compileComponents();
    const fixture = TestBed.createComponent(PasswordInputComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('state', 'error');
    fixture.detectChanges();
    const changed = vi.fn();
    fixture.componentInstance.visibleChange.subscribe(changed);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    expect(button.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('input').type).toBe('password');
    expect(changed).not.toHaveBeenCalled();
  });
});

describe('Text Input validation and loading contract', () => {
  it('associates validation text and retains native disabled/required semantics', async () => {
    await TestBed.configureTestingModule({ imports: [TextInputComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('state', 'error');
    fixture.componentRef.setInput('errorMessage', 'Enter the invoice reference.');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toContain(
      'Enter the invoice reference.',
    );
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    input.focus();
    expect(document.activeElement).not.toBe(input);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});
