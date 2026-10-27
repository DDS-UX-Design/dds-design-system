import { TestBed } from '@angular/core/testing';
import { RatingComponent } from './rating.component';

describe('Rating', () => {
  async function setup(value = 0) {
    await TestBed.configureTestingModule({ imports: [RatingComponent] }).compileComponents();
    const fixture = TestBed.createComponent(RatingComponent);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
    return fixture;
  }

  it('starts unanswered with a named native radio group and associated helper', async () => {
    const fixture = await setup();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('legend')?.textContent).toBe('How was your experience?');
    expect(root.querySelectorAll('input[type=radio]')).toHaveLength(5);
    expect(root.querySelectorAll(':checked')).toHaveLength(0);
    expect(root.querySelector('.dds-rating__summary')?.textContent).toBe('Not rated');
    for (const radio of root.querySelectorAll('input')) {
      expect(radio.getAttribute('aria-label')).toMatch(/^[1-5] of 5, /);
      expect(
        root.querySelector(`[id="${radio.getAttribute('aria-describedby')}"]`)?.textContent,
      ).toContain('Choose one rating.');
    }
  });

  it('selects once, fills stars cumulatively and permits changing the answer', async () => {
    const fixture = await setup();
    const emit = vi.spyOn(fixture.componentInstance.valueChange, 'emit');
    const root: HTMLElement = fixture.nativeElement;
    const radios = root.querySelectorAll<HTMLInputElement>('input');
    radios[3].click();
    fixture.detectChanges();
    expect(emit).toHaveBeenCalledExactlyOnceWith(4);
    expect(root.querySelectorAll(':checked')).toHaveLength(1);
    expect(root.querySelectorAll('.dds-rating__icon--highlighted')).toHaveLength(4);
    expect(root.querySelector('.dds-rating__summary')?.textContent).toBe('4 of 5 · Satisfied');
    radios[3].click();
    expect(emit).toHaveBeenCalledTimes(1);
    radios[1].click();
    fixture.detectChanges();
    expect(emit).toHaveBeenLastCalledWith(2);
    expect(root.querySelectorAll('.dds-rating__icon--highlighted')).toHaveLength(2);
  });

  it('highlights only the selected smiley and derives its feedback level', async () => {
    const fixture = await setup(1);
    fixture.componentRef.setInput('styleType', 'smileys');
    fixture.componentRef.setInput('size', 'compact');
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('.dds-rating__icon--highlighted')).toHaveLength(1);
    expect(
      root
        .querySelector('.dds-rating__icon--highlighted')
        ?.classList.contains('dds-rating__icon--low'),
    ).toBe(true);
    expect(root.querySelector<HTMLElement>('.dds-rating__icon')?.style.maskImage).toContain(
      'angry-compact.svg',
    );
    fixture.componentRef.setInput('value', 5);
    fixture.detectChanges();
    expect(
      root
        .querySelector('.dds-rating__icon--highlighted')
        ?.classList.contains('dds-rating__icon--high'),
    ).toBe(true);
  });

  it('rejects fractional, out-of-range and non-finite scores instead of rounding averages', async () => {
    const fixture = await setup();
    for (const value of [-1, 6, 4.6, NaN, Infinity]) {
      fixture.componentRef.setInput('value', value);
      fixture.detectChanges();
      expect(fixture.componentInstance.selectedValue).toBe(0);
      expect(fixture.nativeElement.querySelectorAll(':checked')).toHaveLength(0);
    }
  });

  it('guards disabled activation and retains the saved selection', async () => {
    const fixture = await setup(3);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const emit = vi.spyOn(fixture.componentInstance.valueChange, 'emit');
    fixture.nativeElement.querySelector('input').click();
    fixture.componentInstance.select(1);
    expect(emit).not.toHaveBeenCalled();
    expect(fixture.componentInstance.selectedValue).toBe(3);
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
  });

  it('keeps groups independent and supports native form values without submitting on selection', async () => {
    const a = await setup();
    const b = TestBed.createComponent(RatingComponent);
    b.detectChanges();
    expect(a.componentInstance.name).not.toBe(b.componentInstance.name);
    const form = document.createElement('form');
    const submit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', submit);
    form.append(a.nativeElement, b.nativeElement);
    a.nativeElement.querySelectorAll('input')[2].click();
    a.detectChanges();
    expect(new FormData(form).get(a.componentInstance.name)).toBe('3');
    expect(new FormData(form).get(b.componentInstance.name)).toBeNull();
    expect(submit).not.toHaveBeenCalled();
  });

  it('retains an accessible legend when the visible label and helper are hidden', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('showLabel', false);
    fixture.componentRef.setInput('showSupportingText', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('legend')?.textContent).toContain('experience');
    expect(fixture.nativeElement.querySelector('[aria-describedby]')).toBeNull();
  });
});
