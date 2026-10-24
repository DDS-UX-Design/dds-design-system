import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

let nextPanelId = 0;

/** A disclosure panel whose projected content stays mounted while closed. */
@Component({
  selector: 'dds-collapsible-panel',
  standalone: true,
  templateUrl: './collapsible-panel.component.html',
  styleUrl: './collapsible-panel.component.css',
})
export class CollapsiblePanelComponent implements OnChanges {
  /** Supply a page-unique ID for stable server-rendered or externally linked panels. */
  @Input() panelId = `dds-collapsible-panel-${nextPanelId++}`;
  @Input() title = 'Panel title';
  @Input() open = false;
  /** Heading level appropriate to the surrounding page outline. */
  @Input() headingLevel: 2 | 3 | 4 | 5 | 6 = 3;
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('header', { static: true }) private header?: ElementRef<HTMLButtonElement>;
  @ViewChild('body', { static: true }) private body?: ElementRef<HTMLElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === false) {
      const body = this.body?.nativeElement;
      if (body?.contains(body.ownerDocument.activeElement)) {
        this.header?.nativeElement.focus({ preventScroll: true });
      }
    }
  }

  toggle(): void {
    this.open = !this.open;
    this.header?.nativeElement.focus({ preventScroll: true });
    this.openChange.emit(this.open);
  }
}
