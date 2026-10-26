import { TestBed } from '@angular/core/testing';
import { userEvent } from 'storybook/test';
import { DateInputComponent } from './date-input.component';

describe('Date Input calendar integration', () => {
  async function setup(mode: 'single' | 'range' = 'single') {
    await TestBed.configureTestingModule({ imports: [DateInputComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('selectionMode', mode);
    fixture.componentRef.setInput(
      'value',
      mode === 'single' ? '23/05/2026' : '18/05/2026 – 23/05/2026',
    );
    fixture.componentRef.setInput('minDate', '05/05/2026');
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const input = root.querySelector('input')!;
    const trigger = root.querySelector<HTMLButtonElement>('.dds-date-input__calendar-trigger')!;
    const changed = vi.fn();
    fixture.componentInstance.valueChange.subscribe(changed);
    const open = () => {
      trigger.click();
      fixture.detectChanges();
    };
    const day = (value: string) => root.querySelector<HTMLButtonElement>(`[data-date="${value}"]`)!;
    return { fixture, root, input, trigger, changed, open, day };
  }

  it('opens from Alt+Down, associates the popup, selects and restores trigger focus', async () => {
    const { fixture, root, input, trigger, changed, day } = await setup();
    input.focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    fixture.detectChanges();
    const popup = root.querySelector('[role="dialog"]')!;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(popup.id);
    expect(document.activeElement).toBe(day('23/05/2026'));
    day('25/05/2026').click();
    fixture.detectChanges();
    expect(input.value).toBe('25/05/2026');
    expect(changed).toHaveBeenCalledExactlyOnceWith('25/05/2026');
    expect(root.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('discards incomplete range edits on Escape and outside pointer/focus without emitting a value', async () => {
    const { fixture, input, open, root, changed, day, trigger } = await setup('range');
    open();
    day('25/05/2026').click();
    fixture.detectChanges();
    expect(input.value).toBe('25/05/2026 – End date');
    expect(changed).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    fixture.detectChanges();
    expect(input.value).toBe('18/05/2026 – 23/05/2026');
    expect(document.activeElement).toBe(trigger);
    open();
    day('25/05/2026').click();
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();
    expect(root.querySelector('[role="dialog"]')).toBeNull();
    expect(changed).not.toHaveBeenCalled();
    open();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    try {
      outside.focus();
      fixture.detectChanges();
      expect(root.querySelector('[role="dialog"]')).toBeNull();
      expect(document.activeElement).toBe(outside);
    } finally {
      outside.remove();
    }
  });

  it('commits a complete range, clears both values, and retains raw text with accessible validation errors', async () => {
    const { fixture, open, day, root, input, changed } = await setup('range');
    open();
    day('25/05/2026').click();
    day('28/05/2026').click();
    fixture.detectChanges();
    expect(changed).toHaveBeenCalledExactlyOnceWith('25/05/2026 – 28/05/2026');
    open();
    [...root.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'Clear')!
      .click();
    fixture.detectChanges();
    expect(changed).toHaveBeenLastCalledWith('');
    expect(input.value).toBe('');
    await userEvent.type(input, '23/05/2026 – 18/05/2026');
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const message = root.querySelector(`#${input.getAttribute('aria-describedby')}`)!;
    expect(message.textContent).toContain('End date must be on or after start date');
    await userEvent.clear(input);
    await userEvent.type(input, '31/02/2026 – 23/05/2026');
    input.blur();
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.value).toBe('31/02/2026 – 23/05/2026');
  });

  it('preserves single-date raw text entry and disables opening for disabled/loading/text-only modes', async () => {
    const { fixture, root, input, changed, trigger, open } = await setup();
    await userEvent.clear(input);
    await userEvent.type(input, '31/02/2026');
    expect(changed).toHaveBeenLastCalledWith('31/02/2026');
    open();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    trigger.click();
    fixture.componentInstance.openCalendar();
    expect(root.querySelector('[role="dialog"]')).toBeNull();
    expect(trigger.disabled).toBe(true);
    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    fixture.componentInstance.openCalendar();
    expect(root.querySelector('input')).toBeNull();
    expect(root.querySelector('[role="dialog"]')).toBeNull();
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('calendarEnabled', false);
    fixture.detectChanges();
    fixture.componentInstance.openCalendar();
    expect(root.querySelector('.dds-date-input__calendar-trigger')).toBeNull();
    expect(root.querySelector('[role="dialog"]')).toBeNull();
  });

  it('flips/clamps its panel at viewport edges and cleans up positioning listeners', async () => {
    const { fixture, root, open } = await setup();
    const remove = vi.spyOn(window, 'removeEventListener');
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      left: 9999,
      top: 680,
      bottom: 780,
    } as DOMRect);
    open();
    const panel = root.querySelector<HTMLElement>('[role="dialog"]')!;
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
      width: 286,
      height: 386,
    } as DOMRect);
    window.dispatchEvent(new Event('resize'));
    expect(panel.style.left).toBe(`${Math.max(8, window.innerWidth - 294)}px`);
    expect(panel.style.top).toBe('286px');
    fixture.destroy();
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    remove.mockRestore();
  });
});
