import { TestBed } from '@angular/core/testing';
import { StepsComponent } from './steps.component';

describe('Steps progress contract', () => {
  afterEach(() => vi.unstubAllGlobals());

  async function setup() {
    await TestBed.configureTestingModule({ imports: [StepsComponent] }).compileComponents();
    const fixture = TestBed.createComponent(StepsComponent);
    fixture.componentRef.setInput(
      'items',
      ['Business', 'Locations', 'Team', 'Review'].map((label) => ({ label, href: `#${label}` })),
    );
    fixture.componentRef.setInput('currentStep', 2);
    fixture.detectChanges();
    return fixture;
  }

  it('exposes ordered progress, position and non-colour status without controlling navigation', async () => {
    const fixture = await setup();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('ol')?.getAttribute('aria-label')).toBe('Process progress');
    expect(root.querySelector('.dds-steps__summary')?.textContent).toContain(
      'Step 2 of 4 · 2 remaining',
    );
    expect([...root.querySelectorAll('li')].map((item) => item.dataset['state'])).toEqual([
      'complete',
      'current',
      'upcoming',
      'upcoming',
    ]);
    expect(root.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    expect(root.querySelector('[aria-current="step"]')?.textContent).toContain('Locations');
    expect(root.querySelector('[aria-current="step"]')?.textContent).toContain('In progress');
    expect(root.querySelectorAll('a')).toHaveLength(1);
    expect(root.querySelector('a')?.getAttribute('href')).toBe('#Business');
    root.querySelector('a')?.addEventListener('click', (event) => event.preventDefault());
    root.querySelector('a')?.click();
    expect(fixture.componentInstance.position).toBe(2);
    expect(root.querySelector('button')).toBeNull();
  });

  it('keeps an invalid stage current and respects saved states when moving backwards', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('items', [
      { label: 'Business', status: 'upcoming' },
      { label: 'Locations', status: 'error' },
      { label: 'Team', status: 'complete', href: '#saved-team' },
      { label: 'Review' },
    ]);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[aria-current="step"]')?.getAttribute('data-state')).toBe('error');
    expect(root.querySelector('[aria-current="step"]')?.textContent).toContain('Needs attention');
    expect([...root.querySelectorAll('li')].map((item) => item.dataset['state'])).toEqual([
      'upcoming',
      'error',
      'complete',
      'upcoming',
    ]);
    expect(root.querySelector('a')?.textContent).toBe('Team');
    fixture.componentRef.setInput('currentStep', 4);
    fixture.detectChanges();
    expect(root.querySelector('[aria-current="step"]')?.getAttribute('data-state')).toBe('current');
    expect(root.querySelector('.dds-steps__summary')?.textContent).toContain('0 remaining');
  });

  it('stacks at the available width, keeps form wording and disconnects its observer', async () => {
    let resize!: ResizeObserverCallback;
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    const fixture = await setup();
    const emit = (width: number) => {
      resize([{ contentRect: { width } } as ResizeObserverEntry], {} as ResizeObserver);
      fixture.detectChanges();
    };
    expect(observe).toHaveBeenCalledWith(fixture.nativeElement);
    emit(280);
    expect(fixture.nativeElement.querySelector('.dds-steps').dataset.orientation).toBe('vertical');
    expect(fixture.nativeElement.textContent).toContain('Step 2 of 4');
    emit(584);
    expect(fixture.nativeElement.querySelector('.dds-steps').dataset.orientation).toBe(
      'horizontal',
    );
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Stage 2 of 4');
    fixture.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('supports other counts, bounds invalid positions and hides empty progress', async () => {
    const fixture = await setup();
    for (const [requested, expected] of [
      [-2, 1],
      [9, 4],
      [NaN, 1],
      [2.9, 2],
    ]) {
      fixture.componentRef.setInput('currentStep', requested);
      fixture.detectChanges();
      expect(fixture.componentInstance.position).toBe(expected);
    }
    fixture.componentRef.setInput('items', [{ label: 'Submit', status: 'complete' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('li').dataset.state).toBe('current');
    expect(fixture.nativeElement.textContent).toContain('Step 1 of 1 · 0 remaining');
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ol')).toBeNull();
  });
});
