import { TestBed } from '@angular/core/testing';
import { StepsFormExampleComponent } from './steps-form.example';

describe('Steps application example', () => {
  it('validates before advancing, preserves data on Back and confirms only after submission', async () => {
    await TestBed.configureTestingModule({
      imports: [StepsFormExampleComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(StepsFormExampleComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const button = (label: string) =>
      [...root.querySelectorAll('button')].find((item) => item.textContent?.trim() === label)!;
    const input = (stage: number) =>
      root.querySelector<HTMLInputElement>(`[data-stage="${stage}"] input`)!;
    const fill = (stage: number, value: string) => {
      input(stage).value = value;
      input(stage).dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    expect(button('Back').disabled).toBe(true);
    button('Continue').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.currentStep).toBe(1);
    expect(input(1).getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(input(1));
    expect(root.querySelector('[aria-current="step"]')?.getAttribute('data-state')).toBe('error');
    fill(1, 'Nairobi Distribution');
    button('Continue').click();
    fixture.detectChanges();
    fill(2, 'Westlands');
    button('Back').click();
    fixture.detectChanges();
    expect(input(1).value).toBe('Nairobi Distribution');
    button('Continue').click();
    fixture.detectChanges();
    expect(input(2).value).toBe('Westlands');
    button('Continue').click();
    fixture.detectChanges();
    button('Continue').click();
    fixture.detectChanges();
    expect(root.querySelector('[aria-current="step"]')?.textContent).toContain('Review');
    expect(root.querySelector('[aria-current="step"]')?.getAttribute('data-state')).toBe('current');
    expect(fixture.componentInstance.submitted).toBe(false);
    button('Submit setup').click();
    fixture.detectChanges();
    expect(root.querySelector('dds-steps')).toBeNull();
    expect(root.textContent).toContain('Store setup complete');
    expect(document.activeElement).toBe(root.querySelector('h3'));
  });
});
