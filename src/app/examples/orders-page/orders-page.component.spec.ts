import { TestBed } from '@angular/core/testing';
import { OrdersPageComponent } from './orders-page.component';
import { EXAMPLE_NAVIGATION } from '../example-navigation';

describe('Orders example', () => {
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
});
