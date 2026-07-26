import { Component, Input } from '@angular/core';
import {
  LucideArrowRight,
  LucideArrowLeft,
  LucideArrowDown,
  LucideArrowUp,
  LucideArrowUpDown,
  LucideCheck,
  LucideChevronRight,
  LucideChevronUp,
  LucideChevronLeft,
  LucideChevronDown,
  LucideChevronsUpDown,
  LucideListFilter,
  LucideCircleAlert,
  LucideDynamicIcon,
  LucideEllipsis,
  LucideInfo,
  LucidePlus,
  LucideTrash2,
  LucideX,
  provideLucideIcons,
  LucideMenu,
  LucideColumns3,
  LucideSearch,
} from '@lucide/angular';

export const DDS_ICON_NAMES = [
  'info',
  'arrow-right',
  'arrow-left',
  'arrow-down',
  'arrow-up-down',  
  'arrow-up',
  'check',
  'chevron-down',
  'chevron-right',
  'chevron-left',
  'chevron-up',
  'chevrons-up-down',
  'list-filter',
  'columns-3',
  'search',
  'menu',
  'circle-alert',
  'ellipsis',
  'plus',
  'trash-2',
  'x',
] as const;

export type DdsIconName = (typeof DDS_ICON_NAMES)[number];

@Component({
  selector: 'dds-icon',
  standalone: true,
  imports: [LucideDynamicIcon],
  providers: [
    provideLucideIcons(
      LucideArrowRight,
      LucideArrowLeft,
      LucideArrowDown,
      LucideArrowUp,
      LucideCheck,
      LucideChevronRight,
      LucideChevronDown,
      LucideChevronsUpDown,
      LucideListFilter,
      LucideMenu,
      LucideCircleAlert,
      LucideEllipsis,
      LucideInfo,
      LucidePlus,
      LucideTrash2,
      LucideX,
      LucideArrowUpDown,
      LucideChevronUp,
      LucideChevronLeft,
      LucideColumns3,
      LucideSearch
    )
  ],
  template: `
    <svg
      [lucideIcon]="name"
      [size]="size"
      [strokeWidth]="strokeWidth"
      [attr.aria-hidden]="decorative ? 'true' : null"
      [title]="decorative ? null : title"
    ></svg>
  `
})
export class IconComponent {
  @Input() name: DdsIconName = 'info';
  @Input() size = 16;
  @Input() strokeWidth: number | string = 2;
  @Input() decorative = true;
  @Input() title?: string;
}