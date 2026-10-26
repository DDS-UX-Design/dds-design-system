import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from '../button/button.component';
import { TooltipDirective } from './tooltip.directive';
import { positionTooltip } from './tooltip-position';

@Component({
  imports: [TooltipDirective, ButtonComponent],
  template: `<section data-theme="dark">
    <div data-theme="light" id="local-theme">
      <dds-button [ddsTooltip]="help" [disabled]="disabled" [tooltipDisabled]="tooltipDisabled"
        >Export report</dds-button
      >
      <button ddsTooltip="Only completed orders are included." aria-describedby="existing-help">
        Order count
      </button>
      <span id="existing-help">Updated hourly.</span>
      <label data-theme="dark">Quantity <input ddsTooltip="Use whole packs." /></label>
    </div>
  </section>`,
})
class TooltipHost {
  @Input() help = 'Download this report as a CSV file.';
  @Input() disabled = false;
  @Input() tooltipDisabled = false;
}

describe('Tooltip trigger lifecycle', () => {
  afterEach(() => vi.useRealTimers());

  async function setup() {
    await TestBed.configureTestingModule({ imports: [TooltipHost] }).compileComponents();
    const fixture = TestBed.createComponent(TooltipHost);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('dds-button button');
    const tooltip = () => document.querySelector<HTMLElement>('dds-tooltip[role="tooltip"]');
    return { fixture, button, tooltip };
  }

  it('describes the native DDS button, preserves its name and inherits the nearest theme scope', async () => {
    const { fixture, button, tooltip } = await setup();
    button.focus();
    fixture.detectChanges();
    const bubble = tooltip()!;
    expect(bubble.textContent).toContain('Download this report as a CSV file.');
    expect(button.getAttribute('aria-describedby')).toBe(bubble.id);
    expect(button.textContent?.trim()).toBe('Export report');
    expect(bubble.parentElement).toBe(fixture.nativeElement.querySelector('#local-theme'));
    expect(bubble.hasAttribute('tabindex')).toBe(false);
    const parentEscape = vi.fn();
    button.parentElement!.addEventListener('keydown', parentEscape);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(tooltip()).toBeNull();
    expect(document.activeElement).toBe(button);
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    expect(parentEscape).not.toHaveBeenCalled();
    // Escape stays dismissed for this focus/hover cycle.
    fixture.nativeElement.querySelector('dds-button').dispatchEvent(new Event('pointerenter'));
    expect(tooltip()).toBeNull();
  });

  it('preserves existing and newly updated descriptions and removes only its own ID', async () => {
    const { fixture, tooltip } = await setup();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-describedby]',
    );
    button.focus();
    fixture.detectChanges();
    expect(button.getAttribute('aria-describedby')).toBe(`existing-help ${tooltip()!.id}`);
    button.setAttribute('aria-describedby', 'existing-help new-help');
    await Promise.resolve();
    expect(button.getAttribute('aria-describedby')).toContain(tooltip()!.id);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(button.getAttribute('aria-describedby')).toBe('existing-help new-help');
  });

  it('keeps the bubble inside an enclosing dialog when its theme scope is outside the dialog', async () => {
    const { fixture, button, tooltip } = await setup();
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    const host = button.parentElement!;
    host.parentElement!.appendChild(dialog);
    dialog.appendChild(host);
    button.focus();
    fixture.detectChanges();
    expect(tooltip()!.parentElement).toBe(dialog);
  });

  it('keeps tooltip text outside a themed label so the input name stays unchanged', async () => {
    const { fixture, tooltip } = await setup();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const label = input.closest('label')!;
    input.focus();
    fixture.detectChanges();
    expect(label.textContent?.trim()).toBe('Quantity');
    expect(label.contains(tooltip())).toBe(false);
    expect(input.getAttribute('aria-describedby')).toBe(tooltip()!.id);
  });

  it('allows crossing onto the bubble, keeps it while hovered, and closes after leaving both', async () => {
    const { fixture, tooltip } = await setup();
    vi.useFakeTimers();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('dds-button');
    trigger.dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    const bubble = tooltip()!;
    trigger.dispatchEvent(new Event('pointerleave'));
    bubble.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(1000);
    expect(tooltip()).toBe(bubble);
    bubble.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(130);
    expect(tooltip()).toBeNull();
    trigger.dispatchEvent(new Event('pointerenter'));
    expect(tooltip()).not.toBeNull();
  });

  it('keeps a focused tooltip when pointer hover ends, and cleans up on destroy', async () => {
    const { fixture, button, tooltip } = await setup();
    vi.useFakeTimers();
    button.focus();
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('dds-button');
    trigger.dispatchEvent(new Event('pointerenter'));
    trigger.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(1000);
    expect(tooltip()).not.toBeNull();
    fixture.destroy();
    expect(tooltip()).toBeNull();
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    vi.runAllTimers();
  });

  it('does not show for disabled controls, disabled tooltips or empty text', async () => {
    const { fixture, tooltip } = await setup();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('dds-button');
    for (const [input, value] of [
      ['disabled', true],
      ['tooltipDisabled', true],
      ['help', '   '],
    ] as const) {
      fixture.componentRef.setInput('disabled', false);
      fixture.componentRef.setInput('tooltipDisabled', false);
      fixture.componentRef.setInput('help', 'Download CSV');
      fixture.componentRef.setInput(input, value);
      fixture.detectChanges();
      trigger.dispatchEvent(new Event('pointerenter'));
      expect(tooltip()).toBeNull();
      trigger.dispatchEvent(new Event('pointerleave'));
    }
  });

  it('closes when its control becomes disabled and updates visible text', async () => {
    const { fixture, button, tooltip } = await setup();
    button.focus();
    fixture.detectChanges();
    fixture.componentRef.setInput('help', 'Only completed orders are included.');
    fixture.detectChanges();
    expect(tooltip()!.textContent).toContain('Only completed orders are included.');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    await Promise.resolve();
    expect(tooltip()).toBeNull();
  });
});

describe('Tooltip positioning geometry', () => {
  const viewport = { left: 0, top: 0, right: 400, bottom: 300 };
  const surface = { width: 160, height: 36 };

  it('keeps the source 4px arrow-tip gap and flips to the opposite side when needed', () => {
    const middle = { left: 180, right: 224, top: 140, bottom: 184 };
    const top = positionTooltip(middle, surface, viewport, 'top', true);
    expect(top.placement).toBe('top');
    expect(top.top + surface.height + 6).toBe(middle.top - 4);
    const edge = { ...middle, top: 2, bottom: 46 };
    const flipped = positionTooltip(edge, surface, viewport, 'top', true);
    expect(flipped.placement).toBe('bottom');
    expect(flipped.top + 4).toBe(edge.bottom + 4);
    expect(flipped.fits).toBe(true);
  });

  it('shifts within the viewport and keeps the arrow aimed at the trigger', () => {
    const trigger = { left: 0, right: 44, top: 140, bottom: 184 };
    const shifted = positionTooltip(trigger, { width: 264, height: 56 }, viewport, 'top', true);
    expect(shifted.left).toBe(8);
    expect(shifted.left + shifted.arrowOffset).toBe(22);
    expect(shifted.left + 264).toBeLessThanOrEqual(viewport.right - 8);
  });

  it('flips horizontal placements and supports arrowless tooltips without covering the trigger', () => {
    const trigger = { left: 2, right: 46, top: 2, bottom: 46 };
    const result = positionTooltip(trigger, surface, viewport, 'left', false);
    expect(result.placement).toBe('right');
    expect(result.left + 4).toBe(trigger.right + 4);
    expect(result.top).toBe(8);
    expect(result.available).toBe(viewport.right - 8 - trigger.right - 4);
  });
});
