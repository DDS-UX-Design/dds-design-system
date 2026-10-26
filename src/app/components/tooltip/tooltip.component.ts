import { Component, Input } from '@angular/core';
import { TooltipPlacement } from './tooltip-position';

let nextTooltipId = 0;

/** Non-interactive tooltip appearance. Use ddsTooltip on a control for runtime behaviour. */
@Component({
  selector: 'dds-tooltip',
  standalone: true,
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.css',
  host: {
    role: 'tooltip',
    '[attr.id]': 'tooltipId',
    '[attr.data-placement]': 'placement',
    '[attr.data-arrow]': 'showArrow',
    '[class.dds-tooltip--multiline]': 'content === "multiline"',
  },
})
export class TooltipComponent {
  @Input() tooltipId = `dds-tooltip-${nextTooltipId++}`;
  @Input() text = '';
  @Input() placement: TooltipPlacement = 'top';
  @Input() content: 'short' | 'multiline' = 'short';
  @Input() showArrow = true;
}
