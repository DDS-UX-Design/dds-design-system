import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import {
  FileUploadComponent,
  FileUploadEntry,
} from '../app/components/file-upload/file-upload.component';
import { FileUploadItemComponent } from '../app/components/file-upload-item/file-upload-item.component';
import { FileUploadExampleComponent } from './file-upload.example';

type Args = FileUploadComponent & Pick<FileUploadExampleComponent, 'mode' | 'stepDelay'>;
const meta: Meta<Args> = {
  title: 'Compositions/Forms/File Upload',
  component: FileUploadComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FileUploadExampleComponent, FileUploadItemComponent] })],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'label',
        'platform',
        'accept',
        'multiple',
        'maxFiles',
        'maxFileSize',
        'disabled',
        'mode',
        'stepDelay',
      ],
    },
    docs: {
      description: {
        component:
          'File selection and a controlled upload list. Bind `[(items)]`, handle `filesAdded` to start transfer, and handle `action` intents (cancel/retry/remove). Only report Complete after transfer **and server checks** succeed; omit progress when unknown. Mark an item `pending` while handling an asynchronous action. Removing a saved attachment may require confirmation and server reconciliation. The stories use a fake transport; the component makes no network requests. PDF/JPG/PNG, 10 MB and five files are example policies, configurable through inputs. Local checks cover type, size, count, zero-byte files and duplicate name/size/lastModified; they do not inspect contents. Repeat authoritative validation on the server. Rejected files do not consume slots; cancelled files retain their slot until removed. Retry requires a retained local File; otherwise Choose another opens the picker. Never silently replace an accepted attachment. Web uses 40px DDS actions; Mobile uses 48px actions and a native picker, without requiring drag-and-drop. Inherit Light/Dark from the nearest data-theme. [Current Figma](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=1935-218).',
      },
    },
  },
  args: {
    label: 'Supporting documents',
    platform: 'web',
    accept: '.pdf,.jpg,.jpeg,.png',
    multiple: true,
    maxFiles: 5,
    maxFileSize: 10000000,
    disabled: false,
    mode: 'automatic',
    stepDelay: 300,
  },
  argTypes: {
    platform: { control: 'radio', options: ['web', 'mobile'] },
    mode: {
      control: 'select',
      options: ['automatic', 'manual', 'fail-first', 'unknown-progress'],
      description: 'Story-only simulated transport.',
    },
    maxFiles: { control: { type: 'number', min: 1, max: 20 } },
    maxFileSize: { control: { type: 'number', min: 1 } },
    stepDelay: { control: { type: 'number', min: 100, max: 2000 } },
  },
  render: (args) => ({
    props: args,
    template: `<dds-file-upload-example [label]="label" [platform]="platform" [accept]="accept" [multiple]="multiple" [maxFiles]="maxFiles" [maxFileSize]="maxFileSize" [disabled]="disabled" [mode]="mode" [stepDelay]="stepDelay" />`,
  }),
};
export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {};
export const ManualSingleFile: Story = {
  args: { mode: 'manual', multiple: false, maxFiles: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const browse = canvas.getByRole('button', { name: 'Browse files' });
    browse.focus();
    await expect(browse).toHaveFocus();
    const area = canvasElement.querySelector('.dds-file-upload__area')!;
    await userEvent.hover(area);
    fireEvent.dragEnter(area, { dataTransfer: { types: ['Files'], files: [] } });
    await expect(canvas.getByText('Drop files to upload')).toBeVisible();
    fireEvent.dragLeave(area, { dataTransfer: { types: ['Files'], files: [] } });
    await expect(canvas.getByText('Drag files here or choose files')).toBeVisible();
    await userEvent.upload(
      canvas.getByLabelText('Supporting documents', { selector: 'input' }),
      new File(['PDF example'], 'delivery-note.pdf', { type: 'application/pdf' }),
    );
    await expect(canvas.getByText('Queued · waiting to upload')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Browse files' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Upload files' }));
    await waitFor(
      () => expect(canvas.getByText('Ready to use · upload and checks complete')).toBeVisible(),
      { timeout: 5000 },
    );
  },
};
export const ValidationAndMixedResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.upload(
      canvas.getByLabelText('Supporting documents', { selector: 'input' }),
      [
        new File(['PDF example'], 'delivery-note.pdf', { type: 'application/pdf' }),
        new File(['example'], 'unsupported.exe', { type: 'application/octet-stream' }),
        new File([], 'empty.pdf', { type: 'application/pdf' }),
      ],
      { applyAccept: false },
    );
    await waitFor(
      () => expect(canvas.getByText('Ready to use · upload and checks complete')).toBeVisible(),
      { timeout: 5000 },
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('1 ready · 2 rejected');
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove unsupported.exe' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Remove empty.pdf' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('Your attachments are ready');
  },
};
export const RetryAndCancel: Story = {
  args: { mode: 'fail-first', stepDelay: 600 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Supporting documents', { selector: 'input' });
    await userEvent.upload(
      input,
      new File(['PDF example'], 'delivery-note.pdf', { type: 'application/pdf' }),
    );
    await waitFor(
      () => expect(canvas.getByRole('button', { name: 'Retry delivery-note.pdf' })).toBeVisible(),
      { timeout: 5000 },
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Retry delivery-note.pdf' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel delivery-note.pdf' }));
    await expect(canvas.getByText('Upload cancelled. File has not been saved.')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
  },
};

function stateItems(): FileUploadEntry[] {
  return [
    { id: 'queued', name: 'delivery-note.pdf', size: 2000000, status: 'queued' },
    { id: 'uploading', name: 'site-photo.jpg', size: 2000000, status: 'uploading', progress: 40 },
    { id: 'unknown', name: 'receipt.pdf', size: 2000000, status: 'uploading' },
    { id: 'processing', name: 'invoice.pdf', size: 2000000, status: 'processing' },
    { id: 'complete', name: 'signed-receipt.pdf', size: 2000000, status: 'complete' },
    {
      id: 'failed',
      name: 'delivery-note.pdf',
      size: 2000000,
      status: 'failed',
      file: new File(['PDF example'], 'delivery-note.pdf'),
    },
    {
      id: 'rejected',
      name: 'delivery-note.exe',
      size: 2000000,
      status: 'rejected',
      message: 'This file type is not accepted. Choose a PDF, JPG or PNG.',
    },
    {
      id: 'cancelled',
      name: 'receipt.pdf',
      size: 2000000,
      status: 'cancelled',
      file: new File(['PDF example'], 'receipt.pdf'),
    },
  ];
}
const comparison = (theme: 'light' | 'dark') => ({
  props: { states: stateItems() },
  template: `<section data-theme="${theme}" style="padding:24px;background:var(--color-bg-default);color:var(--color-text-primary)">
    <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:start">
      <dds-file-upload label="Delivery documents" />
      <dds-file-upload label="Receipt" platform="mobile" [multiple]="false" />
      <dds-file-upload label="Locked attachments" [disabled]="true" disabledReason="This record is locked." />
    </div>
    <h2>File states</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,328px),552px));gap:24px">
      @for (item of states; track item.id) { <dds-file-upload-item [item]="item" /> }
    </div>
  </section>`,
});
export const Light: Story = {
  render: () => comparison('light'),
  parameters: { layout: 'fullscreen' },
};
export const Dark: Story = {
  render: () => comparison('dark'),
  parameters: { layout: 'fullscreen' },
};
export const Mobile: Story = {
  args: { platform: 'mobile' },
  render: (args) => {
    const file = new File(
      [new Uint8Array(2000)],
      'delivery-note-for-the-north-west-regional-distribution-centre-october-2026.pdf',
      { type: 'application/pdf' },
    );
    return {
      props: {
        ...args,
        initialItems: [
          {
            id: 'long',
            name: file.name,
            size: file.size,
            file,
            status: 'failed',
          },
        ],
      },
      template: `<div style="width:328px;max-width:100%"><dds-file-upload-example [label]="label" [platform]="platform" [accept]="accept" [multiple]="multiple" [maxFiles]="maxFiles" [maxFileSize]="maxFileSize" [disabled]="disabled" [mode]="mode" [stepDelay]="stepDelay" [initialItems]="initialItems" /></div>`,
    };
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Browse files' })).toBeDisabled();
    await expect(
      canvas.getByLabelText('Supporting documents', { selector: 'input' }),
    ).toBeDisabled();
    fireEvent.drop(canvasElement.querySelector('.dds-file-upload__area')!, {
      dataTransfer: {
        types: ['Files'],
        files: [new File(['example'], 'note.pdf', { type: 'application/pdf' })],
      },
    });
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
  },
};
