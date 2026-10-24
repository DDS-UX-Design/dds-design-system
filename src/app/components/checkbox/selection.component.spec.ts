import { TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';
import { RadioComponent } from '../radio/radio.component';
import { CheckboxGroupComponent } from '../checkbox-group/checkbox-group.component';
import { RadioGroupComponent } from '../radio-group/radio-group.component';
import { SelectComponent } from '../select/select.component';
import { DateInputComponent } from '../date-input/date-input.component';

describe('Selection native disabled semantics', () => {
  for (const component of [
    CheckboxComponent,
    RadioComponent,
    CheckboxGroupComponent,
    RadioGroupComponent,
    SelectComponent,
    DateInputComponent,
  ]) {
    it(`${component.name} prevents disabled focus and activation`, async () => {
      await TestBed.configureTestingModule({ imports: [component] }).compileComponents();
      const fixture = TestBed.createComponent(component as typeof CheckboxComponent);
      if (component === DateInputComponent) fixture.componentRef.setInput('disabled', true);
      else fixture.componentRef.setInput('state', 'disabled');
      if (component === CheckboxGroupComponent || component === RadioGroupComponent)
        fixture.componentRef.setInput('options', [{ label: 'Nairobi', value: 'nairobi' }]);
      fixture.detectChanges();
      const control: HTMLInputElement = fixture.nativeElement.querySelector('input, select');
      const clicked = vi.fn();
      control.addEventListener('click', clicked);
      control.click();
      control.focus();
      expect(control.matches(':disabled')).toBe(true);
      expect(document.activeElement).not.toBe(control);
      expect(clicked).not.toHaveBeenCalled();
    });
  }
});
