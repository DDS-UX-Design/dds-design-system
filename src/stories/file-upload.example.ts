import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { AlertComponent } from '../app/components/alert/alert.component';
import { ButtonComponent } from '../app/components/button/button.component';
import {
  FileUploadComponent,
  FileUploadEntry,
  FileUploadActionEvent,
  FileUploadPlatform,
} from '../app/components/file-upload/file-upload.component';

/** Story-only fake transport. The production control never times uploads or invents progress. */
@Component({
  selector: 'dds-file-upload-example',
  standalone: true,
  imports: [FileUploadComponent, ButtonComponent, AlertComponent],
  template: `<div style="max-width:552px;display:grid;gap:24px">
    <dds-file-upload
      [label]="label"
      helperText="Attach the delivery note and any relevant photographs."
      [platform]="platform"
      [accept]="accept"
      [maxFileSize]="maxFileSize"
      [multiple]="multiple"
      [maxFiles]="maxFiles"
      [disabled]="disabled"
      disabledReason="This record is locked. Uploads cannot be changed."
      [(items)]="records"
      (filesAdded)="added($event)"
      (action)="handleAction($event)"
    />
    @if (mode === 'manual') {
      <dds-button variant="secondary" [disabled]="disabled || !hasQueued" (click)="uploadQueued()"
        >Upload files</dds-button
      >
    }
    <p style="margin:0;color:var(--color-text-secondary);font-size:14px;line-height:20px">
      Add at least one file. Resolve unfinished or rejected files before continuing.
    </p>
    <dds-button [disabled]="disabled || !canContinue" (click)="submitted = true"
      >Continue</dds-button
    >
    @if (submitted) {
      <dds-alert tone="success" text="Your attachments are ready to use." [dismissible]="false" />
    }
  </div>`,
})
export class FileUploadExampleComponent implements OnInit, OnDestroy {
  @Input() initialItems: FileUploadEntry[] = [];
  @Input() label = 'Supporting documents';
  @Input() accept = '.pdf,.jpg,.jpeg,.png';
  @Input() maxFileSize = 10000000;
  @Input() mode: 'automatic' | 'manual' | 'fail-first' | 'unknown-progress' = 'automatic';
  @Input() platform: FileUploadPlatform = 'web';
  @Input() multiple = true;
  @Input() maxFiles = 5;
  @Input() disabled = false;
  @Input() stepDelay = 300;
  records: FileUploadEntry[] = [];
  submitted = false;
  @ViewChild(FileUploadComponent) upload?: FileUploadComponent;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly jobs = new Map<
    string,
    { abort: AbortController; timer?: ReturnType<typeof setTimeout> }
  >();
  private readonly attempted = new Set<string>();

  ngOnInit(): void {
    this.records = [...this.initialItems];
  }

  get hasQueued(): boolean {
    return this.records.some((item) => item.status === 'queued');
  }
  get canContinue(): boolean {
    return (
      this.records.length > 0 &&
      !this.upload?.batchError &&
      this.records.every((item) => item.status === 'complete')
    );
  }
  added(items: FileUploadEntry[]): void {
    this.submitted = false;
    if (this.mode !== 'manual') items.forEach((item) => this.start(item));
  }
  uploadQueued(): void {
    if (!this.disabled)
      this.records.filter((item) => item.status === 'queued').forEach((item) => this.start(item));
  }
  handleAction(event: FileUploadActionEvent): void {
    if (this.disabled) return;
    this.submitted = false;
    if (event.action === 'cancel') {
      const job = this.jobs.get(event.item.id);
      if (!job) return;
      job.abort.abort();
      this.update(event.item.id, { status: 'cancelled', progress: undefined, message: undefined });
    } else if (event.action === 'retry') this.start(event.item);
    else if (event.action === 'remove') {
      this.records = this.records.filter((item) => item.id !== event.item.id);
    }
  }

  private start(item: FileUploadEntry): void {
    if (!item.file || this.jobs.has(item.id) || this.disabled) return;
    const fail = this.mode === 'fail-first' && !this.attempted.has(item.id);
    this.attempted.add(item.id);
    const job = {
      abort: new AbortController(),
      timer: undefined as ReturnType<typeof setTimeout> | undefined,
    };
    this.jobs.set(item.id, job);
    job.abort.signal.addEventListener('abort', () => {
      clearTimeout(job.timer);
      this.jobs.delete(item.id);
    });
    let progress = 0;
    this.update(item.id, {
      status: 'uploading',
      progress: this.mode === 'unknown-progress' ? undefined : 0,
      message: undefined,
    });
    const advance = () => {
      if (job.abort.signal.aborted) return;
      progress += 25;
      if (fail && progress === 50) {
        this.jobs.delete(item.id);
        this.update(item.id, {
          status: 'failed',
          progress: undefined,
          message: 'Connection lost. Your file was not uploaded.',
        });
        return;
      }
      if (progress < 100) {
        this.update(item.id, { progress: this.mode === 'unknown-progress' ? undefined : progress });
        job.timer = setTimeout(advance, this.stepDelay);
      } else {
        this.update(item.id, { status: 'processing', progress: undefined });
        job.timer = setTimeout(() => {
          if (job.abort.signal.aborted) return;
          this.jobs.delete(item.id);
          this.update(item.id, { status: 'complete', file: undefined });
        }, this.stepDelay * 2);
      }
    };
    job.timer = setTimeout(advance, this.stepDelay);
  }

  private update(id: string, patch: Partial<FileUploadEntry>): void {
    this.records = this.records.map((item) => (item.id === id ? { ...item, ...patch } : item));
    this.cdr.markForCheck();
  }
  ngOnDestroy(): void {
    for (const job of this.jobs.values()) job.abort.abort();
    this.jobs.clear();
  }
}
