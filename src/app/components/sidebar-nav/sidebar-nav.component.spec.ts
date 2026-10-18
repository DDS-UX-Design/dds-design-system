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
