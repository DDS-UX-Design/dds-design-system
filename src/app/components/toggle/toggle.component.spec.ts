import { TestBed } from '@angular/core/testing';
import { userEvent } from 'storybook/test';
import { ToggleComponent } from './toggle.component';
import { ToggleFieldComponent } from '../toggle-field/toggle-field.component';

describe('Toggle native interaction contract', () => {
  it('supports native Space activation and Tab navigation', async () => {
    await TestBed.configureTestingModule({ imports: [ToggleComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ToggleComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.focus();
    await userEvent.keyboard(' ');
    fixture.detectChanges();
    expect(input.checked).toBe(true);
    expect(fixture.componentInstance.checked).toBe(true);
    await userEvent.tab();
    expect(document.activeElement).not.toBe(input);
  });

  it('toggles checked state once per activation and preserves its accessible name', async () => {
    await TestBed.configureTestingModule({ imports: [ToggleComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ToggleComponent);
    fixture.componentRef.setInput('ariaLabel', 'Order updates');
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const changed = vi.fn();
    fixture.componentInstance.checkedChange.subscribe(changed);
    input.click();
    fixture.detectChanges();
    expect(input.checked).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('true');
    expect(input.getAttribute('aria-label')).toBe('Order updates');
    expect(changed).toHaveBeenCalledExactlyOnceWith(true);
    input.click();
    fixture.detectChanges();
    expect(changed).toHaveBeenLastCalledWith(false);
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();
    expect(input.checked).toBe(true);
  });

  for (const preview of [false, true]) {
    it(`disabled ${preview ? 'preview' : 'input'} cannot activate, focus or emit synthetic changes`, async () => {
      await TestBed.configureTestingModule({ imports: [ToggleComponent] }).compileComponents();
      const fixture = TestBed.createComponent(ToggleComponent);
      fixture.componentRef.setInput('checked', true);
      fixture.componentRef.setInput(preview ? 'state' : 'disabled', preview ? 'disabled' : true);
      fixture.detectChanges();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      const changed = vi.fn();
      fixture.componentInstance.checkedChange.subscribe(changed);
      input.click();
      input.focus();
      expect(document.activeElement).not.toBe(input);
      input.checked = false;
      input.dispatchEvent(new Event('change'));
      expect(input.checked).toBe(true);
      expect(changed).not.toHaveBeenCalled();
    });
  }

  it('associates field copy and toggles once when either the label or helper is clicked', async () => {
    await TestBed.configureTestingModule({ imports: [ToggleFieldComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ToggleFieldComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const changed = vi.fn();
    fixture.componentInstance.checkedChange.subscribe(changed);
    const label = fixture.nativeElement.querySelector('.dds-toggle-field__label');
    expect(input.getAttribute('aria-labelledby')).toBe(label.id);
    const helper = fixture.nativeElement.querySelector('.dds-toggle-field__helper');
    expect(input.getAttribute('aria-describedby')).toBe(helper.id);
    label.click();
    fixture.detectChanges();
    expect(changed).toHaveBeenCalledExactlyOnceWith(true);
    helper.click();
    fixture.detectChanges();
    expect(changed).toHaveBeenCalledTimes(2);
    expect(input.checked).toBe(false);
    fixture.componentRef.setInput('showHelperText', false);
    fixture.detectChanges();
    expect(input.getAttribute('aria-describedby')).toBeNull();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    label.click();
    expect(changed).toHaveBeenCalledTimes(2);
  });
});
