import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';

interface TypeStyle {
  name: string;
  size: string;
  weight: number;
  lineHeight: string;
  usage: string;
  className: string;
}

@Component({
  selector: 'app-typography-page',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './typography-page.component.html',
  styleUrl: './typography-page.component.css',
})
export class TypographyPageComponent {
  readonly desktopHeadings: TypeStyle[] = [
    {
      name: 'H1 Desktop',
      size: '32px / 2rem',
      weight: 600,
      lineHeight: '40px',
      usage: 'Primary page titles',
      className: 'heading-desktop-1',
    },
    {
      name: 'H2 Desktop',
      size: '28px / 1.75rem',
      weight: 600,
      lineHeight: '36px',
      usage: 'Major sections',
      className: 'heading-desktop-2',
    },
    {
      name: 'H3 Desktop',
      size: '24px / 1.5rem',
      weight: 600,
      lineHeight: '32px',
      usage: 'Card/page section headers',
      className: 'heading-desktop-3',
    },
    {
      name: 'H4 Desktop',
      size: '20px / 1.25rem',
      weight: 600,
      lineHeight: '28px',
      usage: 'Subsections',
      className: 'heading-desktop-4',
    },
    {
      name: 'H5 Desktop',
      size: '18px / 1.125rem',
      weight: 600,
      lineHeight: '24px',
      usage: 'Smaller grouped headings',
      className: 'heading-desktop-5',
    },
    {
      name: 'H6 Desktop',
      size: '16px / 1rem',
      weight: 600,
      lineHeight: '24px',
      usage: 'Dense enterprise layouts',
      className: 'heading-desktop-6',
    },
  ];

  readonly mobileHeadings: TypeStyle[] = [
    {
      name: 'H1 Mobile',
      size: '24px / 1.5rem',
      weight: 600,
      lineHeight: '32px',
      usage: 'Primary page titles',
      className: 'heading-mobile-1',
    },
    {
      name: 'H2 Mobile',
      size: '22px / 1.375rem',
      weight: 600,
      lineHeight: '30px',
      usage: 'Major sections',
      className: 'heading-mobile-2',
    },
    {
      name: 'H3 Mobile',
      size: '20px / 1.25rem',
      weight: 600,
      lineHeight: '28px',
      usage: 'Card titles',
      className: 'heading-mobile-3',
    },
    {
      name: 'H4 Mobile',
      size: '18px / 1.125rem',
      weight: 600,
      lineHeight: '26px',
      usage: 'Subsections',
      className: 'heading-mobile-4',
    },
    {
      name: 'H5 Mobile',
      size: '16px / 1rem',
      weight: 600,
      lineHeight: '24px',
      usage: 'Compact section headers',
      className: 'heading-mobile-5',
    },
    {
      name: 'H6 Mobile',
      size: '14px / .875rem',
      weight: 600,
      lineHeight: '20px',
      usage: 'Dense labels/group headers',
      className: 'heading-mobile-6',
    },
  ];

  readonly bodyStyles: TypeStyle[] = [
    {
      name: 'body-xl',
      size: '18px / 1.125rem',
      weight: 400,
      lineHeight: '24px',
      usage: 'Leading text',
      className: 'body-xl',
    },
    {
      name: 'body-lg',
      size: '16px / 1rem',
      weight: 400,
      lineHeight: '24px',
      usage: 'Primary reading text',
      className: 'body-lg',
    },
    {
      name: 'body-default',
      size: '14px / .875rem',
      weight: 400,
      lineHeight: '22px',
      usage: 'Standard UI content',
      className: 'body-default',
    },
    {
      name: 'body-sm',
      size: '12px / .75rem',
      weight: 400,
      lineHeight: '18px',
      usage: 'Secondary/meta text',
      className: 'body-sm',
    },
    {
      name: 'body-xs',
      size: '10px / .625rem',
      weight: 400,
      lineHeight: '16px',
      usage: 'Supporting metadata',
      className: 'body-xs',
    },
  ];

  readonly labelStyles: TypeStyle[] = [
    {
      name: 'label-lg',
      size: '16px / 1rem',
      weight: 500,
      lineHeight: '24px',
      usage: '—',
      className: 'label-lg',
    },
    {
      name: 'label-md-600',
      size: '14px / .875rem',
      weight: 600,
      lineHeight: '20px',
      usage: 'Form labels/buttons',
      className: 'label-md-600',
    },
    {
      name: 'label-md',
      size: '14px / .875rem',
      weight: 500,
      lineHeight: '20px',
      usage: 'Form labels/buttons',
      className: 'label-md',
    },
    {
      name: 'label-md-400',
      size: '14px / .875rem',
      weight: 400,
      lineHeight: '20px',
      usage: '—',
      className: 'label-md-400',
    },
    {
      name: 'label-sm-600',
      size: '12px / .75rem',
      weight: 600,
      lineHeight: '16px',
      usage: '—',
      className: 'label-sm-600',
    },
    {
      name: 'label-sm',
      size: '12px / .75rem',
      weight: 500,
      lineHeight: '16px',
      usage: '—',
      className: 'label-sm',
    },
    {
      name: 'label-sm-400',
      size: '12px / .75rem',
      weight: 400,
      lineHeight: '16px',
      usage: '—',
      className: 'label-sm-400',
    },
    {
      name: 'label-xs',
      size: '10px / .625rem',
      weight: 500,
      lineHeight: '16px',
      usage: '—',
      className: 'label-xs',
    },
  ];
}
