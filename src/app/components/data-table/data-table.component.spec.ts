import { TestBed } from '@angular/core/testing';
import { DataTableComponent, DataTableAction } from './data-table.component';

describe('Data Table contextual actions', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [DataTableComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DataTableComponent);
    fixture.componentRef.setInput('columns', [{ key: 'name', label: 'Customer' }]);
    fixture.componentRef.setInput('rows', [{ id: 17, name: 'Jane Smith' }]);
    fixture.componentRef.setInput('showPagination', false);
    return fixture;
  }

  it('renders one overflow trigger per row and emits the original action and row on selection', async () => {
    const fixture = await setup();
    const actions: DataTableAction[] = [
      { label: 'Edit' },
      { label: 'Delete', styleType: 'danger' },
    ];
    fixture.componentRef.setInput('rowActionMenu', actions);
    fixture.detectChanges();
    const emit = vi.spyOn(fixture.componentInstance.rowAction, 'emit');
    const trigger = fixture.nativeElement.querySelector('button[aria-haspopup=menu]');
    expect(fixture.nativeElement.querySelector('dds-button')).toBeNull();
    expect(trigger.getAttribute('aria-label')).toBe('More actions for row 17');
    expect(fixture.nativeElement.querySelectorAll('th')).toHaveLength(2);
    trigger.click();
    expect(emit).not.toHaveBeenCalled();
    fixture.nativeElement.querySelectorAll('[role=menuitem]')[1].click();
    expect(emit).toHaveBeenCalledExactlyOnceWith({
      action: actions[1],
      row: fixture.componentInstance.rows[0],
    });
    expect(emit.mock.calls[0][0]?.action).toBe(actions[1]);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('preserves direct row actions and guards disabled actions', async () => {
    const fixture = await setup();
    const actions = [{ label: 'View customer' }, { label: 'Archive', disabled: true }];
    fixture.componentRef.setInput('rowActions', actions);
    fixture.detectChanges();
    const emit = vi.spyOn(fixture.componentInstance.rowAction, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('dds-button button');
    buttons[0].click();
    buttons[1].click();
    expect(emit).toHaveBeenCalledExactlyOnceWith({
      action: actions[0],
      row: fixture.componentInstance.rows[0],
    });
    expect(fixture.nativeElement.querySelector('[aria-haspopup=menu]')).toBeNull();
  });

  it('maintains empty-state column spans and loading columns with menu actions', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('rowActionMenu', [{ label: 'Edit' }]);
    fixture.componentRef.setInput('rows', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dds-data-table__empty').colSpan).toBe(2);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr')[0].children).toHaveLength(2);
  });

  it('allows a primary direct action beside the overflow trigger without changing event payloads', async () => {
    const fixture = await setup();
    const direct = { label: 'View customer', icon: 'eye' as const };
    const more = { label: 'Archive' };
    fixture.componentRef.setInput('rowActions', [direct]);
    fixture.componentRef.setInput('rowActionMenu', [more]);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector<HTMLElement>('.dds-data-table__actions-column')?.style.width).toBe(
      '96px',
    );
    expect(root.querySelectorAll('.dds-data-table__row-actions button')).toHaveLength(3);
    const emit = vi.spyOn(fixture.componentInstance.rowAction, 'emit');
    root.querySelector<HTMLButtonElement>('dds-button button')!.click();
    root.querySelector<HTMLButtonElement>('button[aria-haspopup=menu]')!.click();
    root.querySelector<HTMLButtonElement>('[role=menuitem]')!.click();
    expect(emit.mock.calls.map((call) => call[0]?.action)).toEqual([direct, more]);
  });
});
