export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Includes the transparent 4px pointer bridge between the arrow tip and trigger. */
export function positionTooltip(
  trigger: TooltipRect,
  surface: { width: number; height: number },
  viewport: TooltipRect,
  preferred: TooltipPlacement,
  showArrow: boolean,
) {
  const tail = showArrow ? 10 : 4;
  const inset = 8;
  const available = {
    top: trigger.top - viewport.top - inset,
    bottom: viewport.bottom - trigger.bottom - inset,
    left: trigger.left - viewport.left - inset,
    right: viewport.right - trigger.right - inset,
  };
  const opposite: Record<TooltipPlacement, TooltipPlacement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  const vertical = preferred === 'top' || preferred === 'bottom';
  const required = (vertical ? surface.height : surface.width) + tail;
  const other = opposite[preferred];
  const placement =
    available[preferred] < required && available[other] > available[preferred] ? other : preferred;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), Math.max(min, max));
  const centerX = (trigger.left + trigger.right) / 2;
  const centerY = (trigger.top + trigger.bottom) / 2;
  const left = vertical
    ? clamp(
        centerX - surface.width / 2,
        viewport.left + inset,
        viewport.right - inset - surface.width,
      )
    : placement === 'left'
      ? trigger.left - surface.width - tail
      : trigger.right;
  const top = vertical
    ? placement === 'top'
      ? trigger.top - surface.height - tail
      : trigger.bottom
    : clamp(
        centerY - surface.height / 2,
        viewport.top + inset,
        viewport.bottom - inset - surface.height,
      );
  const extent = vertical ? surface.width : surface.height;
  const arrowInset = Math.min(10, extent / 2);
  return {
    left,
    top,
    placement,
    arrowOffset: clamp(vertical ? centerX - left : centerY - top, arrowInset, extent - arrowInset),
    available: Math.max(0, available[placement] - tail),
    fits: available[placement] >= required,
  };
}
