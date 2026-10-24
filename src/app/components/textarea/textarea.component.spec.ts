import { TestBed } from '@angular/core/testing';
import { TextareaComponent } from './textarea.component';

describe('Textarea editing and descriptions', () => {
  it('keeps the sizing text, value and character count in sync for edits and external updates', async () => {
    await TestBed.configureTestingModule({ imports: [TextareaComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('maxLength', 150);
    fixture.detectChanges();
    const input: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    const changed = vi.fn();
    fixture.componentInstance.valueChange.subscribe(changed);
    input.value = 'Deliver to reception.\nCall on arrival.';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(changed).toHaveBeenCalledWith(input.value);
    const measure = fixture.nativeElement.querySelector('.dds-textarea__measure');
    expect(measure.textContent).toContain(input.value);
    expect(measure.getAttribute('aria-hidden')).toBe('true');
    expect(fixture.nativeElement.querySelector('.dds-textarea__count').textContent).toContain(
      `${input.value.length}/150`,
    );
    fixture.componentRef.setInput('value', 'Updated by the form');
    fixture.detectChanges();
    expect(input.value).toBe('Updated by the form');
    expect(measure.textContent).toContain(input.value);
  });

  it('omits helper text and stale descriptions while disabled and rejects synthetic edits', async () => {
    await TestBed.configureTestingModule({ imports: [TextareaComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('state', 'disabled');
    fixture.componentRef.setInput('value', 'Archived');
    fixture.detectChanges();
    const input: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(input.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.dds-textarea__supporting-text')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBe(fixture.componentInstance.countId);
    const changed = vi.fn();
    fixture.componentInstance.valueChange.subscribe(changed);
    input.value = 'Unexpected edit';
    input.dispatchEvent(new Event('input'));
    expect(changed).not.toHaveBeenCalled();
    expect(fixture.componentInstance.value).toBe('Archived');
    fixture.componentRef.setInput('state', 'error');
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(fixture.componentInstance.errorId);
  });
});
