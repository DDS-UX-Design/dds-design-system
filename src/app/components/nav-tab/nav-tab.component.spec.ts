import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavTabComponent } from './nav-tab.component';

describe('NavTabComponent', () => {
  let fixture: ComponentFixture<NavTabComponent>;
  let component: NavTabComponent;
  const items = [
    { value: 'first', label: 'First', panelId: 'first-panel' },
    { value: 'disabled', label: 'Disabled', disabled: true },
    { value: 'last', label: 'Last', panelId: 'last-panel' },
  ];
  const buttons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
  const key = (button: HTMLButtonElement, value: string) => {
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NavTabComponent] }).compileComponents();
    fixture = TestBed.createComponent(NavTabComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  });

  it('links panels and maintains one enabled tab stop', () => {
    expect(buttons()[0].getAttribute('aria-controls')).toBe('first-panel');
    expect(buttons().map((button) => button.tabIndex)).toEqual([0, -1, -1]);
    expect(buttons()[1].disabled).toBe(true);
  });

  it('moves focus with wrapping and skips disabled tabs without selecting in manual mode', () => {
    buttons()[0].focus();
    key(buttons()[0], 'ArrowRight');
    expect(document.activeElement).toBe(buttons()[2]);
    expect(component.activeValue).toBe('first');
    key(buttons()[2], 'ArrowRight');
    expect(document.activeElement).toBe(buttons()[0]);
    key(buttons()[0], 'End');
    expect(document.activeElement).toBe(buttons()[2]);
    key(buttons()[2], 'Home');
    expect(document.activeElement).toBe(buttons()[0]);
  });

  it('emits changed selection only and ignores disabled activation', () => {
    const values: string[] = [];
    component.selectedValueChange.subscribe((value) => values.push(value));
    buttons()[1].click();
    buttons()[2].click();
    buttons()[2].click();
    fixture.detectChanges();
    expect(values).toEqual(['last']);
    expect(buttons()[2].getAttribute('aria-selected')).toBe('true');
  });

  it('uses vertical keys and supports automatic activation', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('activation', 'automatic');
    fixture.detectChanges();
    buttons()[0].focus();
    key(buttons()[0], 'ArrowRight');
    expect(document.activeElement).toBe(buttons()[0]);
    key(buttons()[0], 'ArrowDown');
    expect(document.activeElement).toBe(buttons()[2]);
    expect(component.activeValue).toBe('last');
    key(buttons()[2], 'ArrowUp');
    expect(component.activeValue).toBe('first');
  });

  it('handles missing, disabled, removed, and empty selections', () => {
    fixture.componentRef.setInput('selectedValue', 'missing');
    fixture.detectChanges();
    expect(component.activeValue).toBe('first');
    fixture.componentRef.setInput('selectedValue', 'disabled');
    fixture.detectChanges();
    expect(component.activeValue).toBe('first');
    fixture.componentRef.setInput('items', items.slice(1));
    fixture.detectChanges();
    expect(component.activeValue).toBe('last');
    fixture.componentRef.setInput('items', [items[1]]);
    fixture.detectChanges();
    expect(component.activeValue).toBeUndefined();
    expect(buttons()[0].tabIndex).toBe(-1);
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    expect(buttons()).toHaveLength(0);
  });

  it('accepts external selection and restores its tab stop after focus leaves', () => {
    buttons()[0].focus();
    key(buttons()[0], 'ArrowRight');
    buttons()[2].blur();
    fixture.componentRef.setInput('selectedValue', 'first');
    fixture.detectChanges();
    expect(buttons().map((button) => button.tabIndex)).toEqual([0, -1, -1]);
  });
});
