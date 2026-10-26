import { TestBed } from '@angular/core/testing';
import { OrdersPageComponent } from './orders-page.component';
import { EXAMPLE_NAVIGATION } from '../example-navigation';

describe('Orders example', () => {
  afterEach(() => vi.useRealTimers());
  it('places Orders under Sales, outside CRM', () => {
    expect(
      EXAMPLE_NAVIGATION.find((item) => item.id === 'sales')?.children?.map((item) => item.id),
    ).toContain('orders');
    expect(
      EXAMPLE_NAVIGATION.find((item) => item.id === 'crm')?.children?.map((item) => item.id),
    ).not.toContain('orders');
  });
  it('combines search and status, clears selection, paginates and opens details', async () => {
    await TestBed.configureTestingModule({ imports: [OrdersPageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(OrdersPageComponent);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.changePage(2);
    expect(page.visibleOrders[0].id).toBe('ORD-2079');
    page.selectedKeys = ['ORD-2079'];
    page.updateQuery(' acacia ');
    page.updateStatus('processing');
    expect(page.visibleOrders.map((order) => order.id)).toEqual(['ORD-2084']);
    expect(page.currentPage).toBe(1);
    expect(page.selectedKeys).toEqual([]);
    page.showDetails(page.visibleOrders[0]);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#order-detail-title').textContent).toContain(
      'ORD-2084',
    );
    page.updateStatus('delivered');
    expect(page.visibleOrders).toEqual([]);
    page.clearFilters();
    expect(page.filteredOrders).toHaveLength(8);
    expect(page.totalValue).toBe(289200);
  });
  it('auto-dismisses refresh feedback after five seconds and can show it again', async () => {
    await TestBed.configureTestingModule({ imports: [OrdersPageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(OrdersPageComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const page = fixture.componentInstance;
    vi.useFakeTimers();
    for (let attempt = 0; attempt < 2; attempt++) {
      page.refresh();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(root.querySelector('dds-alert')).toBeNull();
      expect(root.querySelector('dds-toast [role="status"]')?.textContent).toContain(
        'Orders are up to date.',
      );
      vi.advanceTimersByTime(4999);
      fixture.detectChanges();
      expect(root.querySelector('dds-toast [role="status"]')).not.toBeNull();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(page.notice).toBe('');
      expect(root.querySelector('dds-toast')).toBeNull();
    }
  });
});
