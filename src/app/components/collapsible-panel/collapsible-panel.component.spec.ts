import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { userEvent } from 'storybook/test';
import { TextInputComponent } from '../text-input/text-input.component';
import { CollapsiblePanelComponent } from './collapsible-panel.component';

@Component({
  imports: [CollapsiblePanelComponent, TextInputComponent],
  template: `<form>
    <dds-collapsible-panel title="Delivery instructions" [open]="open">
      <dds-text-input label="Delivery note" />
    </dds-collapsible-panel>
    <dds-collapsible-panel title="Returns policy"
      >Contact the store with your receipt.</dds-collapsible-panel
    >
  </form>`,
})
class PanelHost {
  @Input() open = true;
}

describe('Collapsible Panel disclosure contract', () => {
  it('associates the header with hidden content and supports Enter/Space without losing focus', async () => {
    await TestBed.configureTestingModule({
      imports: [CollapsiblePanelComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(CollapsiblePanelComponent);
    fixture.componentRef.setInput('panelId', 'shipping-details');
    fixture.componentRef.setInput('headingLevel', 2);
    fixture.detectChanges();
    const header: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const body: HTMLElement = fixture.nativeElement.querySelector('.dds-collapsible-panel__body');
    expect(header.getAttribute('aria-controls')).toBe(body.id);
    expect(header.id).toBe('shipping-details-header');
    expect(fixture.nativeElement.querySelector('[role="heading"]').getAttribute('aria-level')).toBe(
      '2',
    );
    expect(body.hidden).toBe(true);
    expect(body.hasAttribute('inert')).toBe(true);
    const changed = vi.fn();
    fixture.componentInstance.openChange.subscribe(changed);
    header.focus();
    await userEvent.keyboard('{Enter}');
    fixture.detectChanges();
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(body.hidden).toBe(false);
    expect(body.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(header);
    expect(changed).toHaveBeenCalledExactlyOnceWith(true);
    await userEvent.keyboard(' ');
    fixture.detectChanges();
    expect(body.hidden).toBe(true);
    expect(document.activeElement).toBe(header);
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed).toHaveBeenLastCalledWith(false);
  });

  it('preserves projected controls and returns focus when an external update closes their panel', async () => {
    await TestBed.configureTestingModule({ imports: [PanelHost] }).compileComponents();
    const fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'Call reception on arrival.';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.focus();
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    const header: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(document.activeElement).toBe(header);
    expect(fixture.nativeElement.querySelector('input')).toBe(input);
    expect(input.value).toBe('Call reception on arrival.');
    await userEvent.tab();
    expect(document.activeElement).not.toBe(input);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input')).toBe(input);
    expect(input.value).toBe('Call reception on arrival.');
  });

  it('keeps grouped panels independent and does not submit a surrounding form', async () => {
    await TestBed.configureTestingModule({ imports: [PanelHost] }).compileComponents();
    const fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
    const panels = fixture.debugElement.queryAll(By.directive(CollapsiblePanelComponent));
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    const submit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', submit);
    const headers: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    headers[1].click();
    fixture.detectChanges();
    expect(panels[0].componentInstance.open).toBe(true);
    expect(panels[1].componentInstance.open).toBe(true);
    expect(headers[0].getAttribute('aria-controls')).not.toBe(
      headers[1].getAttribute('aria-controls'),
    );
    expect(submit).not.toHaveBeenCalled();
  });
});
