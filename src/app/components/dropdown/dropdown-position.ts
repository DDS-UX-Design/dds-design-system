export type DropdownDirection = 'down' | 'up';

/** Viewport coordinates for a top-layer menu, retaining the 8px anchor gap. */
export function positionDropdown(
  trigger: { left: number; right: number; top: number; bottom: number },
  surface: { width: number; height: number },
  viewport: { width: number; height: number },
  preferred: DropdownDirection,
  align: 'start' | 'end',
) {
  const inset = 8;
  const gap = 8;
  const width = Math.min(surface.width, Math.max(0, viewport.width - inset * 2));
  const available = {
    down: Math.max(0, viewport.height - inset - trigger.bottom - gap),
    up: Math.max(0, trigger.top - inset - gap),
  };
  const opposite = preferred === 'down' ? 'up' : 'down';
  const direction =
    available[preferred] < surface.height && available[opposite] > available[preferred]
      ? opposite
      : preferred;
  const maxHeight = available[direction];
  const height = Math.min(surface.height, maxHeight);
  const left = Math.max(
    inset,
    Math.min(
      align === 'end' ? trigger.right - width : trigger.left,
      viewport.width - inset - width,
    ),
  );
  const top = direction === 'up' ? trigger.top - gap - height : trigger.bottom + gap;
  return { left, top, width, maxHeight, direction };
}
