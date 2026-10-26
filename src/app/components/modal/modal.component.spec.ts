import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'storybook/test';
import { ModalComponent } from './modal.component';
import { ModalRequestExampleComponent } from '../../../stories/modal-request.example';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ModalComponent],
  template: `<button (click)="open = true">Open task</button
    ><dds-modal
      [(open)]="open"
      title="Edit delivery"
      message="Update the receiving contact."
      [intent]="intent"
      [state]="state"
      [closeOnBackdrop]="backdrop"
      (confirmed)="confirmed = confirmed + 1"
      ><input aria-label="Contact" value="Reception"
    /></dds-modal>`,
})
class ModalHost {
  open = false;
  intent: 'standard' | 'destructive' = 'standard';
  state: 'default' | 'submitting' | 'error' = 'default';
  backdrop = false;
  confirmed = 0;
}

describe('Modal dialog contract', () => {
  // jsdom has no top layer or native dialog methods. These stand-ins only model
  // open/close events; native inertness and rendered geometry need browser review.
  beforeEach(() => {
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value: vi.fn(function (this: HTMLDialogElement) {
          this.setAttribute('open', '');
        }),
      },
      close: {
        configurable: true,
        value: vi.fn(function (this: HTMLDialogElement) {
          this.removeAttribute('open');
          this.dispatchEvent(new Event('close'));
        }),
      },
    });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function setup(intent: 'standard' | 'destructive' = 'standard') {
    await TestBed.configureTestingModule({ imports: [ModalHost] }).compileComponents();
    const fixture = TestBed.createComponent(ModalHost);
    fixture.componentInstance.intent = intent;
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const trigger = root.querySelector('button')!;
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    const dialog = root.querySelector('dialog')!;
    return { fixture, root, trigger, dialog, host: fixture.componentInstance };
  }

  it('opens a labelled native modal, contains Tab/Shift+Tab and restores focus and scrolling on Escape', async () => {
    const previous = document.body.style.overflow;
    const { fixture, dialog, trigger, host } = await setup();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe(
      'Edit delivery',
    );
    expect(document.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent).toBe(
      'Update the receiving contact.',
    );
    expect(document.activeElement).toBe(dialog.querySelector('h2'));
    expect(document.body.style.overflow).toBe('hidden');
    const buttons = dialog.querySelectorAll('button');
    buttons[buttons.length - 1].focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(buttons[0]);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    await userEvent.keyboard('{Escape}');
    fixture.detectChanges();
    expect(host.open).toBe(false);
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe(previous);
  });

  it('focuses the least destructive action and leaves confirmation completion to the application', async () => {
    const { fixture, dialog, host, trigger } = await setup('destructive');
    const secondary = dialog.querySelector<HTMLButtonElement>('[data-secondary] button')!;
    expect(document.activeElement).toBe(secondary);
    dialog.querySelector<HTMLButtonElement>('.dds-button--danger')!.click();
    fixture.detectChanges();
    expect(host.confirmed).toBe(1);
    expect(dialog.open).toBe(true);
    secondary.click();
    fixture.detectChanges();
    expect(host.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('prevents duplicates, all dismissal and field interaction during submission and preserves input on error', async () => {
    const { fixture, dialog, host } = await setup();
    const input = dialog.querySelector('input')!;
    input.value = 'Westlands receiving team';
    host.state = 'submitting';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(dialog.getAttribute('aria-busy')).toBe('true');
    expect(input.closest('[inert]')).not.toBeNull();
    for (const button of dialog.querySelectorAll('button')) {
      expect(button.disabled).toBe(true);
      button.click();
    }
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    await userEvent.keyboard('{Escape}');
    await userEvent.tab();
    expect(document.activeElement).toBe(dialog.querySelector('h2'));
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(true);
    expect(host.confirmed).toBe(0);
    host.state = 'error';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(dialog.querySelector('input')).toBe(input);
    expect(input.value).toBe('Westlands receiving team');
    expect(input.closest('[inert]')).toBeNull();
    expect(dialog.querySelector('[role="alert"]')?.textContent).toContain(
      'Your changes are preserved',
    );
    expect([...dialog.querySelectorAll('button')].every((button) => !button.disabled)).toBe(true);
  });

  it('distinguishes backdrop gestures from padding clicks and never backdrop-dismisses destructive dialogs', async () => {
    const { fixture, dialog, host } = await setup();
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 660,
      top: 100,
      bottom: 400,
    } as DOMRect);
    const gesture = (x: number) => {
      dialog.dispatchEvent(
        new MouseEvent('pointerdown', { clientX: x, clientY: 200, bubbles: true }),
      );
      dialog.dispatchEvent(new MouseEvent('click', { clientX: x, clientY: 200, bubbles: true }));
      fixture.detectChanges();
    };
    gesture(10);
    expect(host.open).toBe(true);
    host.backdrop = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    gesture(110);
    expect(host.open).toBe(true);
    host.intent = 'destructive';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    gesture(10);
    expect(host.open).toBe(true);
    host.intent = 'standard';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    gesture(10);
    expect(host.open).toBe(false);
  });

  it('restores state on external close/destruction and ignores stale native close events after reopening', async () => {
    const { fixture, dialog, host, trigger } = await setup();
    host.open = false;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
    trigger.click();
    fixture.detectChanges();
    dialog.dispatchEvent(new Event('close'));
    expect(host.open).toBe(true);
    fixture.destroy();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('uses the mobile Button sizes and releases its responsive listener', async () => {
    const removeEventListener = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener, removeEventListener }));
    const { fixture, dialog } = await setup();
    expect(dialog.querySelectorAll('.dds-button--large')).toHaveLength(2);
    expect(dialog.querySelectorAll('.dds-button--full-width')).toHaveLength(2);
    fixture.destroy();
    expect(removeEventListener).toHaveBeenCalledWith('change', addEventListener.mock.calls[0][1]);
  });

  it('demonstrates a bounded failed request and retry without losing projected form values', async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRequestExampleComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ModalRequestExampleComponent);
    fixture.detectChanges();
    vi.useFakeTimers();
    const root: HTMLElement = fixture.nativeElement;
    root.querySelector('button')!.click();
    fixture.detectChanges();
    const input = root.querySelector('input')!;
    input.value = 'Call reception first.';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const save = () => {
      root.querySelector<HTMLButtonElement>('dialog footer dds-button:last-child button')!.click();
      fixture.detectChanges();
    };
    save();
    save();
    expect(fixture.componentInstance.state).toBe('submitting');
    vi.advanceTimersByTime(1200);
    fixture.detectChanges();
    expect(fixture.componentInstance.state).toBe('error');
    expect(input.value).toBe('Call reception first.');
    save();
    vi.advanceTimersByTime(1200);
    fixture.detectChanges();
    expect(fixture.componentInstance.open).toBe(false);
    expect(fixture.componentInstance.instructions).toBe('Call reception first.');
    expect(root.querySelector('dds-toast')?.textContent).toContain('Instructions updated');
  });
});
