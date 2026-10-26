# Button semantic colour migration

Button now reads the generated `--color-*` tokens directly and inherits the nearest `data-theme="light"` or `data-theme="dark"` ancestor. Changing a Storybook background alone does not select a theme. Use Building Blocks / Actions / Button / Light or Dark for review.

| Treatment        | Default                                    | Hover                             | Disabled                                   |
| ---------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------ |
| Primary          | interactive/default + text/on-interactive  | interactive/hover                 | bg/subtle + text/disabled                  |
| Danger (Primary) | feedback/error + text/on-feedback          | interactive/danger-hover          | bg/subtle + text/disabled                  |
| Secondary        | bg/elevated + border/strong + text/primary | bg/subtle                         | bg/subtle + border/default + text/disabled |
| Ghost            | bg/transparent + text/primary              | unchanged, matching current Figma | bg/transparent + text/disabled             |

Token names in this table have the `color/` prefix. Icons inherit current text colour. Ghost underline also inherits text colour.

Focus is independent of pressing. Primary and Secondary use a 3px `color/border/focus` shadow with an elevated-surface border; Danger uses `color/border/focus-danger`. Ghost uses a focus-coloured border. Both actual DOM focus and the existing `state="focused"` preview receive these treatments. Disabled takes precedence over preview states and cannot activate.

Native Primary press uses `color/interactive/pressed`. Danger press currently reuses its hover token because a distinct semantic destructive pressed token is not defined. Secondary press uses the subtle surface; Ghost remains transparent. This is native interaction feedback, not an added public state prop or a claim that Figma has a complete pressed matrix.

This change preserves the component API, dimensions and icon placements. Legacy global `--btn-*` colour aliases remain for compatibility with other consumers; Button no longer reads them. This is a colour migration, not certification of loading-state coverage, responsive sizing, or every component's code/Figma parity.

Review the Light/Dark matrices, actual keyboard/pointer focus, disabled behaviour and icon-only accessible names before merging. Existing product screens using Button will inherit the new appearance and should receive visual review.
