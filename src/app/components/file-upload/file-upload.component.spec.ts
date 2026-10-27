import { TestBed } from '@angular/core/testing';
import { FileUploadComponent, FileUploadEntry } from './file-upload.component';
import { FileUploadItemComponent } from '../file-upload-item/file-upload-item.component';
import { FileUploadExampleComponent } from '../../../stories/file-upload.example';

const pdf = (name = 'delivery-note.pdf', size = 12) =>
  new File(['x'.repeat(size)], name, { type: 'application/pdf', lastModified: 123 });

describe('File Upload selection and validation', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [FileUploadComponent] }).compileComponents();
    const fixture = TestBed.createComponent(FileUploadComponent);
    fixture.detectChanges();
    return fixture;
  }
  function drag(files: File[] = [], types = ['Files']): DragEvent {
    return {
      preventDefault: vi.fn(),
      dataTransfer: { files, types, dropEffect: 'none' },
    } as unknown as DragEvent;
  }

  it('labels the native picker and uses the same queued selection path for picker and drop', async () => {
    const fixture = await setup();
    const root: HTMLElement = fixture.nativeElement;
    const input = root.querySelector<HTMLInputElement>('input')!;
    expect(root.querySelector('label')?.htmlFor).toBe(input.id);
    expect(input.accept).toBe('.pdf,.jpg,.jpeg,.png');
    expect(input.multiple).toBe(true);
    expect(
      root.querySelector(`[id="${input.getAttribute('aria-describedby')}"]`)?.textContent,
    ).toContain('10 MB');
    const selected = vi.spyOn(fixture.componentInstance.filesAdded, 'emit');
    Object.defineProperty(input, 'files', { value: [pdf()], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.componentInstance.drop(drag([pdf('photo.pdf')]));
    fixture.detectChanges();
    expect(fixture.componentInstance.items.map((item) => item.status)).toEqual([
      'queued',
      'queued',
    ]);
    expect(selected).toHaveBeenCalledTimes(2);
    expect(input.value).toBe('');
    expect(root.querySelectorAll('li')).toHaveLength(2);
  });

  it('retains valid files when type, size and empty-file checks reject other files', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('maxFileSize', 12);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.selectFiles([
      pdf(),
      pdf('too-large.pdf', 13),
      pdf('empty.pdf', 0),
      new File(['x'], 'script.exe'),
    ]);
    expect(page.items.map((item) => item.status)).toEqual([
      'queued',
      'rejected',
      'rejected',
      'rejected',
    ]);
    expect(page.items[1].message).toContain('exceeds');
    expect(page.items[2].message).toContain('empty');
    expect(page.items[3].message).toContain('not accepted');
    expect(page.acceptedCount).toBe(1);
  });

  it('handles MIME wildcards, uppercase extensions and empty MIME types', async () => {
    const fixture = await setup();
    const page = fixture.componentInstance;
    page.selectFiles([new File(['x'], 'PHOTO.PNG')]);
    expect(page.items[0].status).toBe('queued');
    fixture.componentRef.setInput('accept', 'image/*');
    fixture.detectChanges();
    page.selectFiles([new File(['x'], 'photo.avif', { type: 'image/avif' }), pdf()]);
    expect(page.items.slice(1).map((item) => item.status)).toEqual(['queued', 'rejected']);
  });

  it('rejects local duplicates without replacing the original', async () => {
    const fixture = await setup();
    const page = fixture.componentInstance;
    const original = pdf();
    page.selectFiles([original, pdf()]);
    expect(page.items[0].file).toBe(original);
    expect(page.items[1].status).toBe('rejected');
    expect(page.items[1].message).toContain('already selected');
  });

  it('enforces single-file and batch limits without silently replacing accepted files', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('multiple', false);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.selectFiles([pdf('first.pdf'), pdf('second.pdf')]);
    fixture.detectChanges();
    expect(page.items).toHaveLength(1);
    expect(page.items[0].name).toBe('first.pdf');
    expect(page.batchError).toContain('1 file was not added');
    expect(fixture.nativeElement.querySelector('input').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain(
      'Maximum 1 file',
    );
    page.selectFiles([pdf('third.pdf')]);
    expect(page.items[0].name).toBe('first.pdf');
  });

  it('preserves the previous selection on picker cancellation and replaces only rejected/local-unavailable rows', async () => {
    const fixture = await setup();
    const page = fixture.componentInstance;
    page.selectFiles([new File(['x'], 'invalid.exe')]);
    const original = page.items[0];
    const picker = fixture.nativeElement.querySelector('input');
    const open = vi.spyOn(picker, 'click').mockImplementation(() => {});
    page.browse(original.id);
    page.pickerCancelled();
    expect(page.items[0]).toBe(original);
    page.selectFiles([pdf()], original.id);
    expect(page.items).toHaveLength(1);
    expect(page.items[0].status).toBe('queued');
    const valid = page.items[0];
    page.selectFiles([pdf('another.pdf')], valid.id);
    expect(page.items[0]).toBe(valid);
    expect(open).toHaveBeenCalledOnce();
  });

  it('guards disabled picker/drop/actions and ignores text drags and child-boundary dragleave', async () => {
    const fixture = await setup();
    const page = fixture.componentInstance;
    page.dragEnter(drag([], ['text/plain']));
    expect(page.dragOver).toBe(false);
    page.dragEnter(drag());
    page.dragEnter(drag());
    page.dragLeave(drag());
    expect(page.dragOver).toBe(true);
    page.dragLeave(drag());
    expect(page.dragOver).toBe(false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const added = vi.spyOn(page.filesAdded, 'emit');
    page.selectFiles([pdf()]);
    page.drop(drag([pdf()]));
    page.dragEnter(drag());
    expect(page.items).toHaveLength(0);
    expect(added).not.toHaveBeenCalled();
    expect(page.dragOver).toBe(false);
  });

  it('keeps mixed batch status explicit and emits action intents without claiming an abort/removal', async () => {
    const fixture = await setup();
    const items: FileUploadEntry[] = ['complete', 'processing', 'failed'].map((status, index) => ({
      id: `${index}`,
      name: `${index}.pdf`,
      size: 1,
      status: status as FileUploadEntry['status'],
      file: pdf(),
    }));
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.summary).toBe('1 ready · 1 processing · 1 failed');
    const emit = vi.spyOn(page.action, 'emit');
    fixture.nativeElement.querySelector('button').click(); // Browse does not remove anything.
    const remove = [...fixture.nativeElement.querySelectorAll('dds-file-upload-item button')].find(
      (button: any) => button.textContent.includes('Remove'),
    ) as HTMLButtonElement;
    remove.click();
    expect(emit).toHaveBeenCalledExactlyOnceWith({ action: 'remove', item: items[0] });
    expect(page.items).toBe(items);
  });

  it('restores focus after controlled removal and frees a count-limit slot', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('maxFiles', 1);
    const entry: FileUploadEntry = {
      id: 'a',
      name: 'note.pdf',
      size: 1,
      status: 'queued',
      file: pdf(),
    };
    fixture.componentRef.setInput('items', [entry]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('dds-file-upload-item button').focus();
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('Browse files');
    expect(fixture.componentInstance.limitReached).toBe(false);
  });
});

describe('File item lifecycle', () => {
  async function setup(status: FileUploadEntry['status'] = 'uploading', progress?: number) {
    await TestBed.configureTestingModule({
      imports: [FileUploadItemComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(FileUploadItemComponent);
    fixture.componentRef.setInput('item', {
      id: 'a',
      name: 'a-long-delivery-note.pdf',
      size: 2000000,
      status,
      progress,
      file: pdf(),
    });
    fixture.detectChanges();
    return fixture;
  }
  it('uses reliable progress only, and 100% sent never implies checks succeeded', async () => {
    const fixture = await setup('uploading', 100);
    expect(
      fixture.nativeElement.querySelector('[role=progressbar]').getAttribute('aria-valuenow'),
    ).toBe('100');
    expect(fixture.nativeElement.textContent).not.toContain('Ready to use');
    fixture.componentRef.setInput('item', {
      ...fixture.componentInstance.item,
      progress: undefined,
    });
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role=progressbar]').hasAttribute('aria-valuenow'),
    ).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('%');
    fixture.componentRef.setInput('item', {
      ...fixture.componentInstance.item,
      status: 'processing',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('checking file');
    fixture.componentRef.setInput('item', {
      ...fixture.componentInstance.item,
      status: 'complete',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('upload and checks complete');
  });
  it('names actions contextually and requires a local file for retries', async () => {
    const fixture = await setup('cancelled');
    expect(fixture.nativeElement.querySelector('button').textContent).toContain(
      'Retry a-long-delivery-note.pdf',
    );
    expect(fixture.nativeElement.querySelector('.dds-upload-item__name').textContent).toBe(
      'a-long-delivery-note.pdf',
    );
    fixture.componentRef.setInput('item', { ...fixture.componentInstance.item, file: undefined });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Choose another');
  });
  it('guards invalid, disabled and pending action activation', async () => {
    const fixture = await setup();
    const emit = vi.spyOn(fixture.componentInstance.action, 'emit');
    fixture.componentInstance.activate('retry');
    fixture.componentRef.setInput('item', { ...fixture.componentInstance.item, pending: true });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.componentInstance.activate('cancel');
    expect(emit).not.toHaveBeenCalled();
    fixture.componentRef.setInput('item', { ...fixture.componentInstance.item, pending: false });
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.componentInstance.activate('cancel');
    expect(emit).not.toHaveBeenCalled();
  });
});

describe('File Upload story transport', () => {
  afterEach(() => vi.useRealTimers());
  async function setup(mode: FileUploadExampleComponent['mode'] = 'automatic') {
    await TestBed.configureTestingModule({
      imports: [FileUploadExampleComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(FileUploadExampleComponent);
    fixture.componentRef.setInput('mode', mode);
    fixture.detectChanges();
    return fixture;
  }
  const entry = (): FileUploadEntry => ({
    id: 'a',
    name: 'note.pdf',
    size: 12,
    file: pdf(),
    status: 'queued',
  });
  it('requires processing completion before final submission and retries without duplicating the file', async () => {
    vi.useFakeTimers();
    const fixture = await setup('fail-first');
    const page = fixture.componentInstance;
    const item = entry();
    page.records = [item];
    page.added([item]);
    vi.advanceTimersByTime(600);
    expect(page.records[0].status).toBe('failed');
    expect(page.canContinue).toBe(false);
    page.handleAction({ action: 'retry', item: page.records[0] });
    vi.advanceTimersByTime(1200);
    expect(page.records[0].status).toBe('processing');
    expect(page.canContinue).toBe(false);
    vi.advanceTimersByTime(600);
    expect(page.records[0].status).toBe('complete');
    expect(page.canContinue).toBe(true);
    expect(page.records).toHaveLength(1);
  });
  it('aborts cancellation and destruction so late callbacks cannot claim completion', async () => {
    vi.useFakeTimers();
    const fixture = await setup();
    const page = fixture.componentInstance;
    const item = entry();
    page.records = [item];
    page.added([item]);
    page.handleAction({ action: 'cancel', item });
    vi.advanceTimersByTime(5000);
    expect(page.records[0].status).toBe('cancelled');
    page.handleAction({ action: 'retry', item: page.records[0] });
    fixture.destroy();
    vi.advanceTimersByTime(5000);
    expect(page.records[0].status).toBe('uploading');
  });
  it('supports manual transfer without uploading on selection', async () => {
    vi.useFakeTimers();
    const fixture = await setup('manual');
    const page = fixture.componentInstance;
    const item = entry();
    page.records = [item];
    page.added([item]);
    vi.advanceTimersByTime(5000);
    expect(page.records[0].status).toBe('queued');
    page.uploadQueued();
    expect(page.records[0].status).toBe('uploading');
  });
});
