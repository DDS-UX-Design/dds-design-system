import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { FileUploadItemComponent } from '../file-upload-item/file-upload-item.component';
import {
  FileUploadActionEvent,
  FileUploadEntry,
  FileUploadPlatform,
  formatFileSize,
} from './file-upload.types';
export type {
  FileUploadEntry,
  FileUploadPlatform,
  FileUploadActionEvent,
} from './file-upload.types';
let nextUploadId = 0;

/** Selection and local validation, with application-owned upload actions and results. */
@Component({
  selector: 'dds-file-upload',
  standalone: true,
  imports: [ButtonComponent, FileUploadItemComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
  host: { '[class.dds-file-upload-host--mobile]': "platform === 'mobile'" },
})
export class FileUploadComponent implements OnChanges, AfterViewChecked {
  @Input() inputId = `dds-file-upload-${nextUploadId++}`;
  @Input() label = 'Attachments';
  @Input() helperText = '';
  @Input() accept = '.pdf,.jpg,.jpeg,.png';
  @Input() maxFileSize = 10000000;
  @Input() maxFiles = 5;
  @Input() multiple = true;
  @Input() disabled = false;
  @Input() disabledReason = 'Uploads are currently unavailable.';
  @Input() platform: FileUploadPlatform = 'web';
  @Input() items: FileUploadEntry[] = [];
  @Output() itemsChange = new EventEmitter<FileUploadEntry[]>();
  /** Queued selections only. The application can start immediately or provide a separate Upload action. */
  @Output() filesAdded = new EventEmitter<FileUploadEntry[]>();
  /** Intent only: confirm cancellation/removal with the server before updating the controlled item. */
  @Output() action = new EventEmitter<FileUploadActionEvent>();
  @ViewChild('picker') private picker?: ElementRef<HTMLInputElement>;
  private readonly root = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private nextItem = 0;
  private dragDepth = 0;
  private replacement?: string;
  private removalFocusIndex?: number;
  dragOver = false;
  batchError = '';

  get limit(): number {
    return this.multiple
      ? Math.max(1, Math.floor(Number.isFinite(this.maxFiles) ? this.maxFiles : 5))
      : 1;
  }
  get sizeLimit(): number {
    return this.maxFileSize > 0 && Number.isFinite(this.maxFileSize) ? this.maxFileSize : 10000000;
  }
  get acceptedCount(): number {
    return this.items.filter((item) => item.status !== 'rejected').length;
  }
  get limitReached(): boolean {
    return this.acceptedCount >= this.limit;
  }
  get areaDisabled(): boolean {
    return this.disabled || this.limitReached;
  }
  get pickerDisabled(): boolean {
    return this.disabled || (this.limitReached && !this.replacement);
  }
  get pickerMultiple(): boolean {
    return this.multiple && !this.replacement;
  }
  get requirements(): string {
    const types = [
      ...new Set(
        this.accept
          .split(',')
          .map((rule) =>
            rule
              .trim()
              .replace(/^\./, '')
              .toUpperCase()
              .replace(/^JPEG$/, 'JPG'),
          )
          .filter(Boolean),
      ),
    ];
    const names =
      types.length > 1
        ? `${types.slice(0, -1).join(', ')} or ${types.at(-1)}`
        : types[0] || 'Any file type';
    return `${names} · Up to ${formatFileSize(this.sizeLimit)} each\nMaximum ${this.limit} ${this.limit === 1 ? 'file' : 'files'}`;
  }
  get areaTitle(): string {
    if (!this.disabled && this.limitReached) return 'File limit reached';
    return this.dragOver && !this.areaDisabled
      ? 'Drop files to upload'
      : this.platform === 'mobile'
        ? 'Choose files to upload'
        : 'Drag files here or choose files';
  }
  get summary(): string {
    const counts = new Map<string, number>();
    const labels = {
      queued: 'queued',
      uploading: 'uploading',
      processing: 'processing',
      complete: 'ready',
      failed: 'failed',
      rejected: 'rejected',
      cancelled: 'cancelled',
    };
    this.items.forEach((item) =>
      counts.set(labels[item.status], (counts.get(labels[item.status]) ?? 0) + 1),
    );
    return [...counts].map(([label, count]) => `${count} ${label}`).join(' · ');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.areaDisabled) {
      this.dragOver = false;
      this.dragDepth = 0;
    }
    if (!changes['items']) return;
    if (!this.limitReached) this.batchError = '';
    const active = this.root.nativeElement.ownerDocument.activeElement;
    if (!active || !this.root.nativeElement.contains(active)) return;
    const id = active.closest('[data-upload-id]')?.getAttribute('data-upload-id');
    if (id && !this.items.some((item) => item.id === id)) {
      this.removalFocusIndex = (changes['items'].previousValue as FileUploadEntry[]).findIndex(
        (item) => item.id === id,
      );
    }
  }

  ngAfterViewChecked(): void {
    if (this.removalFocusIndex === undefined) return;
    const rows = this.root.nativeElement.querySelectorAll<HTMLElement>('[data-upload-id]');
    const row = rows[Math.min(this.removalFocusIndex, rows.length - 1)];
    const target =
      row?.querySelector<HTMLButtonElement>('button:not(:disabled)') ??
      this.root.nativeElement.querySelector<HTMLButtonElement>(
        '.dds-file-upload__browse button:not(:disabled)',
      );
    this.removalFocusIndex = undefined;
    (target ?? this.root.nativeElement.querySelector<HTMLElement>('.dds-file-upload'))?.focus();
  }

  browse(replaceId?: string): void {
    if (this.disabled || (!replaceId && this.limitReached)) return;
    this.replacement = replaceId;
    this.cdr.detectChanges();
    this.picker?.nativeElement.click();
  }

  handlePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length) this.selectFiles(files, this.replacement);
    input.value = '';
    this.replacement = undefined;
  }
  pickerCancelled(): void {
    this.replacement = undefined;
  }

  selectFiles(files: File[], replaceId?: string): void {
    if (this.disabled || !files.length) return;
    this.cdr.markForCheck();
    const target = this.items.find((item) => item.id === replaceId);
    const canReplace =
      target &&
      (target.status === 'rejected' ||
        (['failed', 'cancelled'].includes(target.status) && !target.file));
    if (replaceId && !canReplace) return;
    const existing = canReplace ? this.items.filter((item) => item.id !== replaceId) : this.items;
    let count = existing.filter((item) => item.status !== 'rejected').length;
    this.batchError = '';
    const additions: FileUploadEntry[] = [];
    let excess = 0;
    for (const file of canReplace ? files.slice(0, 1) : files) {
      if (count >= this.limit) {
        excess++;
        continue;
      }
      const duplicate = [...existing, ...additions].some(
        (item) =>
          item.status !== 'rejected' &&
          item.file &&
          item.name === file.name &&
          item.size === file.size &&
          item.file.lastModified === file.lastModified,
      );
      const message = duplicate
        ? 'This file is already selected.'
        : file.size === 0
          ? 'This file is empty. Choose a file with content.'
          : !this.accepts(file)
            ? `This file type is not accepted. ${this.requirements.split(' · ')[0]} required.`
            : file.size > this.sizeLimit
              ? `File exceeds ${formatFileSize(this.sizeLimit)}. Choose a smaller file.`
              : undefined;
      additions.push({
        id: `${this.inputId}-item-${this.nextItem++}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        status: message ? 'rejected' : 'queued',
        message,
      });
      if (!message) count++;
    }
    if (excess)
      this.batchError = `${excess} ${excess === 1 ? 'file was' : 'files were'} not added. Maximum ${this.limit} ${this.limit === 1 ? 'file' : 'files'}; remove a file before adding another.`;
    if (!additions.length) return;
    const index = canReplace
      ? this.items.findIndex((item) => item.id === replaceId)
      : this.items.length;
    const next = [...existing];
    next.splice(index, 0, ...additions);
    this.items = next;
    this.itemsChange.emit(next);
    const queued = additions.filter((item) => item.status === 'queued');
    if (queued.length) this.filesAdded.emit(queued);
  }

  handleAction(event: FileUploadActionEvent): void {
    if (this.disabled || event.item.pending) return;
    if (event.action === 'replace') this.browse(event.item.id);
    else this.action.emit(event);
  }

  dragEnter(event: DragEvent): void {
    if (!this.isFileDrag(event) || this.platform === 'mobile') return;
    event.preventDefault();
    this.dragDepth++;
    if (!this.areaDisabled) this.dragOver = true;
  }
  dragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (!this.dragDepth) this.dragOver = false;
  }
  dragMove(event: DragEvent): void {
    if (!this.isFileDrag(event)) return;
    event.preventDefault();
    if (event.dataTransfer)
      event.dataTransfer.dropEffect =
        this.areaDisabled || this.platform === 'mobile' ? 'none' : 'copy';
  }
  drop(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = 0;
    this.dragOver = false;
    if (this.areaDisabled || this.platform === 'mobile') return;
    this.selectFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  private isFileDrag(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
  }
  private accepts(file: File): boolean {
    const rules = this.accept
      .toLowerCase()
      .split(',')
      .map((rule) => rule.trim())
      .filter(Boolean);
    return (
      !rules.length ||
      rules.some((rule) =>
        rule.startsWith('.')
          ? file.name.toLowerCase().endsWith(rule)
          : rule.endsWith('/*')
            ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
            : file.type.toLowerCase() === rule,
      )
    );
  }
}
