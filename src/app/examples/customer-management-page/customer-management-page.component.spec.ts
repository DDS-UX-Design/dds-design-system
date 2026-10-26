import { TestBed } from '@angular/core/testing';
import { CustomerManagementPageComponent } from './customer-management-page.component';

describe('Customer Management prototype', () => {
  const setup = async (state = 'ready') => {
    await TestBed.configureTestingModule({
      imports: [CustomerManagementPageComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(CustomerManagementPageComponent);
    fixture.componentRef.setInput('initialState', state);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    return fixture;
  };

  afterEach(() => vi.useRealTimers());

  it('combines case-insensitive search with status and resets pagination and selection', async () => {
    const fixture = await setup();
    const page = fixture.componentInstance;
    page.currentPage = 3;
    page.selectedKeys = [1];
    page.updateSearch(' NAIROBI ');
    page.updateStatus('active');
    expect(page.filteredCustomers.map((row) => row.name)).toEqual([
      'Acacia Market',
      'Metro Wholesale',
    ]);
    expect(page.currentPage).toBe(1);
    expect(page.selectedKeys).toEqual([]);
    page.updateSearch('unknown');
    expect(page.visibleCustomers).toEqual([]);
    page.clearFilters();
    expect(page.filteredCustomers).toHaveLength(12);
  });

  it('fails a refresh once, then retries successfully without discarding filters', async () => {
    const fixture = await setup();
    vi.useFakeTimers();
    const page = fixture.componentInstance;
    page.updateStatus('pending');
    page.failNextRequest = true;
    page.refreshTable();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(page.loading).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).toBeTruthy();
    vi.advanceTimersByTime(700);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(page.error).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Customers could not be loaded');
    page.refreshTable();
    vi.advanceTimersByTime(700);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(page.error).toBe(false);
    expect(page.statusFilter).toBe('pending');
    expect(page.visibleCustomers).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('Coastline Traders');
  });

  it('rejects blank fields and adds a customer to an empty list', async () => {
    const fixture = await setup('empty');
    const page = fixture.componentInstance;
    page.openCreate();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    page.saveCustomer(new Event('submit'));
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(page.customers).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('Enter a customer name.');
    page.draftName = ' Sunrise Stores ';
    page.draftLocation = ' Nairobi, KE ';
    page.saveCustomer(new Event('submit'));
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(page.customers[0].name).toBe('Sunrise Stores');
    expect(page.creating).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Sunrise Stores added successfully.');
  });

  it('paginates, opens details and clears selection when pages change', async () => {
    const fixture = await setup();
    const page = fixture.componentInstance;
    page.selectedKeys = [1];
    page.changePage(2);
    expect(page.visibleCustomers[0].name).toBe('Greenline Stores');
    expect(page.selectedKeys).toEqual([]);
    page.showDetails(page.visibleCustomers[0]);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#customer-detail-title').textContent).toContain(
      'Greenline Stores',
    );
    page.changePage(99);
    expect(page.currentPage).toBe(3);
  });

  it('cancels pending requests on destruction', async () => {
    const fixture = await setup();
    vi.useFakeTimers();
    const page = fixture.componentInstance;
    page.refreshTable();
    fixture.destroy();
    vi.advanceTimersByTime(1000);
    expect(page.loading).toBe(true);
  });
  it('keeps Retry available after dismissing the error Toast, then shows dismissible success feedback', async () => {
    const fixture = await setup('error');
    vi.useFakeTimers();
    const page = fixture.componentInstance;
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('dds-alert')).toBeNull();
    expect(root.querySelector('dds-toast [role="alert"]')?.textContent).toContain(
      'Customers could not be loaded',
    );
    root.querySelector<HTMLButtonElement>('dds-toast button')!.click();
    fixture.detectChanges();
    expect(page.error).toBe(true);
    expect(root.querySelector('dds-toast')).toBeNull();
    const retry = [...root.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Retry',
    )!;
    retry.click();
    fixture.detectChanges();
    vi.advanceTimersByTime(700);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(page.error).toBe(false);
    expect(root.querySelector('dds-toast [role="status"]')?.textContent).toContain(
      'Customer records are up to date.',
    );
    root.querySelector<HTMLButtonElement>('dds-toast button')!.click();
    fixture.detectChanges();
    expect(page.notice).toBe('');
    expect(root.querySelector('dds-toast')).toBeNull();
    page.failNextRequest = true;
    page.refreshTable();
    vi.advanceTimersByTime(700);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(root.querySelector('dds-toast [role="alert"]')).not.toBeNull();
  });
});
