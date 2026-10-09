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
