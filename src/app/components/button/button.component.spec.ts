import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent pointer focus', () => {
  it('focuses on click without scrolling and still delivers the click', async () => {
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const focus = vi.spyOn(button, 'focus');
    const clicked = vi.fn();
    button.addEventListener('click', clicked);

    button.click();

    expect(document.activeElement).toBe(button);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(clicked).toHaveBeenCalledOnce();
  });

  it('does not focus or activate a disabled button', async () => {
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const focus = vi.spyOn(button, 'focus');
    const clicked = vi.fn();
    button.addEventListener('click', clicked);

    button.click();

    expect(focus).not.toHaveBeenCalled();
    expect(clicked).not.toHaveBeenCalled();
  });
});

describe('Button native contract', () => {
  it('preserves native submit type, icon naming and disabled preview precedence', async () => {
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('type', 'submit');
    fixture.componentRef.setInput('iconType', 'icon-only');
    fixture.componentRef.setInput('ariaLabel', 'Save delivery details');
    fixture.componentRef.setInput('state', 'disabled');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.type).toBe('submit');
    expect(button.getAttribute('aria-label')).toBe('Save delivery details');
    expect(button.disabled).toBe(true);
    const clicked = vi.fn();
    button.addEventListener('click', clicked);
    button.click();
    expect(clicked).not.toHaveBeenCalled();
  });
});
