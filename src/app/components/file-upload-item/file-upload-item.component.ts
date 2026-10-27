import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import {
  FileUploadAction,
  FileUploadActionEvent,
  FileUploadEntry,
  FileUploadPlatform,
  formatFileSize,
} from '../file-upload/file-upload.types';
let nextUploadItemId = 0;

/** A controlled upload row. The application reports the actual transfer/server result. */
@Component({
  selector: 'dds-file-upload-item',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './file-upload-item.component.html',
  styleUrl: './file-upload-item.component.css',
})
export class FileUploadItemComponent {
  @Input({ required: true }) item!: FileUploadEntry;
  @Input() platform: FileUploadPlatform = 'web';
  @Input() disabled = false;
  @Output() action = new EventEmitter<FileUploadActionEvent>();
  readonly id = `dds-upload-item-${nextUploadItemId++}`;

  get extension(): string {
    const dot = this.item.name.lastIndexOf('.');
    return dot > 0 ? this.item.name.slice(dot) : '';
  }
  get stem(): string {
    return this.extension ? this.item.name.slice(0, -this.extension.length) : this.item.name;
  }

  get percentage(): number | undefined {
    return this.item.status === 'uploading' && Number.isFinite(this.item.progress)
      ? Math.min(100, Math.max(0, this.item.progress!))
      : undefined;
  }
  get metadata(): string {
    const extension = this.item.name.includes('.')
      ? this.item.name.split('.').at(-1)!.toUpperCase()
      : 'File';
    return `${extension} · ${formatFileSize(this.item.size)}`;
  }
  get statusText(): string {
    if (this.item.message) return this.item.message;
    switch (this.item.status) {
      case 'queued':
        return 'Queued · waiting to upload';
      case 'uploading':
        return this.percentage === undefined
          ? 'Uploading… · progress unavailable'
          : `Uploading · ${this.percentage}% · ${formatFileSize((this.item.size * this.percentage) / 100)} of ${formatFileSize(this.item.size)}`;
      case 'processing':
        return 'Upload received · checking file…';
      case 'complete':
        return 'Ready to use · upload and checks complete';
      case 'failed':
        return 'Upload failed. Please try again.';
      case 'rejected':
        return 'File rejected. Check the requirements and choose another file.';
      case 'cancelled':
        return 'Upload cancelled. File has not been saved.';
    }
  }
  get actions(): Array<{ action: FileUploadAction; label: string }> {
    switch (this.item.status) {
      case 'uploading':
        return [{ action: 'cancel', label: 'Cancel' }];
      case 'processing':
        return [];
      case 'failed':
      case 'cancelled':
        return [
          this.item.file
            ? { action: 'retry', label: 'Retry' }
            : { action: 'replace', label: 'Choose another' },
          { action: 'remove', label: 'Remove' },
        ];
      case 'rejected':
        return [
          { action: 'replace', label: 'Choose another' },
          { action: 'remove', label: 'Remove' },
        ];
      default:
        return [{ action: 'remove', label: 'Remove' }];
    }
  }
  activate(action: FileUploadAction): void {
    if (
      this.disabled ||
      this.item.pending ||
      !this.actions.some((option) => option.action === action)
    )
      return;
    this.action.emit({ action, item: this.item });
  }
}
