import { TestBed } from '@angular/core/testing';
import { DropdownComponent, DropdownItem } from './dropdown.component';
import { positionDropdown } from './dropdown-position';

describe('Dropdown / Dropup action menu', () => {
  const items: DropdownItem[] = [
    { label: 'Edit' },
    { label: 'Export', disabled: true },
    { label: 'Duplicate' },
    { label: 'Delete', styleType: 'danger' },
  ];

  async function setup() {
    await TestBed.configureTestingModule({ imports: [DropdownComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DropdownComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    return fixture;
  }
  const key = (element: Element, value: string) => {
    const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    return event;
  };

  it('opens from the trigger with linked menu semantics and focuses the first action', async () => {
    const fixture = await setup();
    const root: HTMLElement = fixture.nativeElement;
    const trigger = root.querySelector('button')!;
    expect(trigger.type).toBe('button');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    fixture.detectChanges();
    const menu = root.querySelector<HTMLElement>('[role=menu]')!;
    expect(menu.hidden).toBe(false);
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
    expect(menu.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(document.activeElement?.textContent?.trim()).toBe('Edit');
    expect(root.querySelectorAll('[role=separator]')).toHaveLength(1);
    expect(root.querySelectorAll('[role=menuitem][tabindex="0"]')).toHaveLength(1);
  });

  it('wraps arrow navigation, skips disabled items and supports Home, End and Escape', async () => {
    const fixture = await setup();
    const root: HTMLElement = fixture.nativeElement;
    const trigger = root.querySelector('button')!;
    key(trigger, 'ArrowUp');
    const menu = root.querySelector('[role=menu]')!;
    expect(document.activeElement?.textContent?.trim()).toBe('Delete');
    key(menu, 'ArrowDown');
    expect(document.activeElement?.textContent?.trim()).toBe('Edit');
    key(menu, 'ArrowDown');
    expect(document.activeElement?.textContent?.trim()).toBe('Duplicate');
    key(menu, 'Home');
    expect(document.activeElement?.textContent?.trim()).toBe('Edit');
    key(menu, 'End');
    expect(document.activeElement?.textContent?.trim()).toBe('Delete');
    key(menu, 'Escape');
    expect(fixture.componentInstance.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('emits the original action once, restores focus before the callback and guards disabled items', async () => {
    const fixture = await setup();
    const root: HTMLElement = fixture.nativeElement;
    const trigger = root.querySelector('button')!;
    const callback = vi.fn(() => expect(document.activeElement).toBe(trigger));
    fixture.componentInstance.itemSelect.subscribe(callback);
    trigger.click();
    fixture.componentInstance.select(items[1]);
    expect(callback).not.toHaveBeenCalled();
    root.querySelectorAll<HTMLButtonElement>('[role=menuitem]')[3].click();
    expect(callback).toHaveBeenCalledExactlyOnceWith(items[3]);
    expect(fixture.componentInstance.open).toBe(false);
  });

  it('dismisses on Tab without preventing native traversal, and on outside pointer activation', async () => {
    const fixture = await setup();
    const root: HTMLElement = fixture.nativeElement;
    const trigger = root.querySelector('button')!;
    trigger.click();
    expect(key(root.querySelector('[role=menu]')!, 'Tab').defaultPrevented).toBe(false);
    expect(fixture.componentInstance.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    trigger.click();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(fixture.componentInstance.open).toBe(false);
  });

  it('uses the popover top layer and dismisses when the table scrolls, not when its menu scrolls', async () => {
    const fixture = await setup();
    const root: HTMLElement = fixture.nativeElement;
    const menu = root.querySelector<HTMLElement>('[role=menu]')!;
    menu.showPopover = vi.fn();
    menu.hidePopover = vi.fn();
    root.querySelector('button')!.click();
    expect(menu.showPopover).toHaveBeenCalledOnce();
    menu.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.open).toBe(true);
    document.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.open).toBe(false);
    expect(menu.hidePopover).toHaveBeenCalledOnce();
  });

  it('supports all-disabled lists without a focus trap and disables an empty or disabled trigger', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput(
      'items',
      items.map((item) => ({ ...item, disabled: true })),
    );
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    const menu = fixture.nativeElement.querySelector('[role=menu]');
    expect(document.activeElement).toBe(menu);
    key(menu, 'ArrowDown');
    key(menu, 'Escape');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.componentInstance.show('first');
    expect(fixture.componentInstance.open).toBe(false);
    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });

  it('accepts an initially open preview without stealing focus', async () => {
    const fixture = await setup();
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=menu]').hidden).toBe(false);
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it('notifies the owner when disabling an open menu closes it', async () => {
    const fixture = await setup();
    fixture.componentInstance.show('first');
    const emit = vi.spyOn(fixture.componentInstance.openChange, 'emit');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.open).toBe(false);
    expect(emit).toHaveBeenCalledExactlyOnceWith(false);
  });
});

describe('Dropdown positioning', () => {
  const viewport = { width: 800, height: 600 };
  const size = { width: 248, height: 171 };
  it('keeps the preferred direction and exact trigger gap when it fits', () => {
    expect(
      positionDropdown(
        { left: 40, right: 184, top: 40, bottom: 80 },
        size,
        viewport,
        'down',
        'start',
      ),
    ).toMatchObject({ left: 40, top: 88, width: 248, direction: 'down' });
    expect(
      positionDropdown(
        { left: 40, right: 184, top: 400, bottom: 440 },
        size,
        viewport,
        'up',
        'start',
      ),
    ).toMatchObject({ top: 221, direction: 'up' });
  });
  it('flips at the bottom and shifts a right-aligned menu within the viewport', () => {
    expect(
      positionDropdown(
        { left: 760, right: 792, top: 550, bottom: 582 },
        size,
        viewport,
        'down',
        'end',
      ),
    ).toMatchObject({ left: 544, top: 371, direction: 'up' });
  });
  it('constrains long menus to available space and narrow screens', () => {
    const result = positionDropdown(
      { left: 10, right: 42, top: 100, bottom: 132 },
      { width: 248, height: 900 },
      { width: 240, height: 400 },
      'up',
      'start',
    );
    expect(result).toMatchObject({
      left: 8,
      top: 140,
      width: 224,
      maxHeight: 252,
      direction: 'down',
    });
  });
});
