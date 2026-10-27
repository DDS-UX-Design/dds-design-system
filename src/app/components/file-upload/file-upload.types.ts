export type FileUploadStatus =
  'queued' | 'uploading' | 'processing' | 'complete' | 'failed' | 'rejected' | 'cancelled';
export type FileUploadPlatform = 'web' | 'mobile';

export interface FileUploadEntry {
  id: string;
  name: string;
  size: number;
  type?: string;
  /** Retain only while the local file is needed. Persisted attachments may omit this. */
  file?: File;
  status: FileUploadStatus;
  /** Reliable transfer percentage only. Omit when the total is unknown. */
  progress?: number;
  message?: string;
  /** Application-owned action in flight; prevents duplicate activation. */
  pending?: boolean;
}

export type FileUploadAction = 'cancel' | 'retry' | 'remove' | 'replace';
export interface FileUploadActionEvent {
  action: FileUploadAction;
  item: FileUploadEntry;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1000000) return `${Number((bytes / 1000).toFixed(1))} KB`;
  return `${Number((bytes / 1000000).toFixed(1))} MB`;
}
