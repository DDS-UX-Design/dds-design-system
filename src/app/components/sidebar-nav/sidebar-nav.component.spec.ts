import { TestBed } from '@angular/core/testing';
import { SidebarNavComponent } from './sidebar-nav.component';

describe('SidebarNavComponent collapse', () => {
  it('preserves active children and expanded groups through collapse and restores child access', async () => {
    await TestBed.configureTestingModule({ imports: [SidebarNavComponent] }).compileComponents();
    const fixture = TestBed.createComponent(SidebarNavComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [
      { id: 'orders', label: 'Orders', children: [{ id: 'pending', label: 'Pending' }] },
    ]);
    fixture.componentRef.setInput('expandedIds', ['orders']);
    fixture.componentRef.setInput('activeItemId', 'pending');
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const changes: boolean[] = [];
    component.collapsedChange.subscribe((value) => changes.push(value));
    root.querySelector<HTMLButtonElement>('.dds-sidebar-nav__toggle')!.click();
    fixture.detectChanges();
    expect(root.classList.contains('dds-sidebar-nav--collapsed')).toBe(true);
    expect(root.querySelector('.dds-sidebar-nav__toggle')!.getAttribute('aria-label')).toBe(
      'Expand sidebar',
    );
    expect(root.querySelector<HTMLElement>('.dds-sidebar-nav__submenu')!.hidden).toBe(true);
    expect(component.expandedIds).toEqual(['orders']);
    expect(component.activeItemId).toBe('pending');
    root.querySelector<HTMLButtonElement>('.dds-sidebar-nav__parent')!.click();
    fixture.detectChanges();
    expect(root.querySelector<HTMLElement>('.dds-sidebar-nav__submenu')!.hidden).toBe(false);
    expect(root.querySelector('.dds-sidebar-nav__child')!.getAttribute('aria-current')).toBe(
      'page',
    );
    expect(changes).toEqual([true, false]);
  });
});

describe('SidebarNavComponent Figma anatomy', () => {
  it('renders secondary destinations below a divider and retains selection semantics', async () => {
    await TestBed.configureTestingModule({ imports: [SidebarNavComponent] }).compileComponents();
    const fixture = TestBed.createComponent(SidebarNavComponent);
    fixture.componentRef.setInput('items', [{ id: 'orders', label: 'Orders' }]);
    fixture.componentRef.setInput('bottomItems', [
      { id: 'settings', label: 'Settings', href: '#settings' },
      { id: 'locked', label: 'Unavailable', disabled: true },
    ]);
    fixture.detectChanges();
    const selected = vi.fn();
    fixture.componentInstance.itemSelect.subscribe(selected);
    const lists = fixture.nativeElement.querySelectorAll('.dds-sidebar-nav__list');
    expect(lists.length).toBe(2);
    const link = lists[1].querySelector('a') as HTMLAnchorElement;
    link.addEventListener('click', (event) => event.preventDefault());
    link.click();
    fixture.detectChanges();
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(selected).toHaveBeenCalledOnce();
    (lists[1].querySelector('button') as HTMLButtonElement).click();
    expect(selected).toHaveBeenCalledOnce();
  });

  it('uses the nearest theme logo, observes theme changes and preserves custom artwork', async () => {
    await TestBed.configureTestingModule({ imports: [SidebarNavComponent] }).compileComponents();
    const fixture = TestBed.createComponent(SidebarNavComponent);
    const themeBoundary = document.createElement('div');
    themeBoundary.setAttribute('data-theme', 'dark');
    document.body.appendChild(themeBoundary);
    themeBoundary.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toBe('images/dds-brand-icon.svg');
    expect(image.width).toBe(23);
    expect(image.height).toBe(24);
    fixture.nativeElement.setAttribute('data-theme', 'light');
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    fixture.detectChanges();
    expect(image.getAttribute('src')).toBe('images/dds-brand-icon-light.svg');
    fixture.nativeElement.removeAttribute('data-theme');
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    fixture.detectChanges();
    expect(image.getAttribute('src')).toBe('images/dds-brand-icon.svg');
    fixture.componentRef.setInput('logoSrc', 'images/custom-logo.svg');
    fixture.detectChanges();
    expect(image.getAttribute('src')).toBe('images/custom-logo.svg');
    fixture.destroy();
    themeBoundary.remove();
  });
});

describe('Sidebar collapsed tooltip keyboard dismissal', () => {
  it('dismisses a pointer tooltip on Escape even when focus is on the toggle', async () => {
    await TestBed.configureTestingModule({ imports: [SidebarNavComponent] }).compileComponents();
    const fixture = TestBed.createComponent(SidebarNavComponent);
    fixture.componentRef.setInput('collapsed', true);
    fixture.componentRef.setInput('items', [{ id: 'orders', label: 'Orders' }]);
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('.dds-sidebar-nav__parent')
      .dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tooltip"]')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tooltip"]')).toBeNull();
  });
});
