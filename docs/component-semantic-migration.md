# Component semantic colour migration

## Starting state and inventory

Started on `main` at `fe4400c`. PR #3 (pipeline) and PR #4 (Button) are merged in local history. Button implementation was inspected: direct generated names, native focus/press, destructive focus and disabled precedence are present. No AGENTS.md was found.

Existing uncommitted changes in `documentation.json`, the token snapshot and generated JSON, plus the untracked Figma export, are preserved and excluded from component commits. Importing `tokens/dds-figma-export.json` with `tokens:sync` reported no additions, removals or renames. `tokens:build` validates 182 tokens. Relative to HEAD the token diff only decodes an apostrophe in a chart description; generated CSS is unchanged. The supplied export was validated, but its freshness against live Figma was not independently verified.

Migration inventory/order (all listed controls exist):

1. Text Input, Textarea, Password Input, Search, OTP Input: legacy field colours; Password focus primitive; OTP required primitive; Search suggestion primitive and shadow literal.
2. Checkbox/Checkbox Group, Radio/Radio Group, Select, Date Input: legacy colours. Toggle is absent. Date Input follows the related field controls.
3. Alert, Toast, Status Badge: legacy feedback colours.
4. Nav Tab, Sidebar Nav, Top Bar Nav, Page Toolbar, Minimal/Numbered Pagination, Data Table, KPI Card, Chart, Skeleton and Loading Overlay: legacy/primitive colours; Chart also embeds colours in TypeScript. Spinner embeds fixed colours in SVG background artwork; Icon uses currentColor. Shared aliases remain because these consumers still need them.

## Text entry family

Changed five component stylesheets, added `text-entry-semantic.stories.ts` and native disabled regression tests. No public inputs, outputs, templates, dimensions or loading contracts were changed.

| Purpose                                                      | Generated role                                                                    |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Input/suggestion surface                                     | `--color-bg-elevated`                                                             |
| Disabled surface / suggestion hover and keyboard-active      | `--color-bg-subtle`                                                               |
| Labels and entered text                                      | `--color-text-primary`                                                            |
| Helper text / counts / expiry / placeholder                  | `--color-text-secondary`, `--color-text-muted`                                    |
| Disabled text/icons                                          | `--color-text-disabled`                                                           |
| Search and visibility icon                                   | `--color-icon-default`; SVG inherits currentColor                                 |
| Resting border                                               | `--color-border-default` or `--color-border-strong` (existing emphasis preserved) |
| Native/preview focus                                         | `--color-border-focus`                                                            |
| Required marker, invalid border, validation and expired text | `--color-feedback-error`                                                          |
| Invalid native/preview focus ring                            | `--color-border-focus-danger`                                                     |
| Search menu shadow                                           | `--color-effect-shadow`                                                           |

Disabled styling overrides preview and validation colours while retaining the existing border geometry. Text Input error copy previously lost its error colour to the later helper rule; this cascade is corrected. Password visibility remains natively disabled and keeps its existing guard. Search has no disabled API; no new state was added. Text fields have no distinct hover/pressed design treatment; native focus-within was audited separately from preview classes. Search hover and keyboard selection share the subtle-surface role. OTP tracks native focus on the current digit; invalid active digits receive destructive focus.

Light/Dark/Comparison stories include realistic labels, long validation and delivery content, disabled combinations and suggestions. Their browser assertions cover resolved semantic roles, native focus and keyboard selection. These assertions require a browser; successful compilation alone does not execute them.

### Separate design/component gaps

- Skeleton is a shared dependency still using legacy colours; loading branches are outside this family’s completed colour surface.
- No dedicated placeholder, disabled-border or disabled-icon semantic role exists. Proposed/use mappings: text-muted, border-default and text-disabled respectively. These reuse purpose-compatible semantics, not primitives.
- Loading coverage, field geometry, mobile sizing, full accessibility and full Figma parity were not inferred from token checks.
- Existing product examples change appearance where Search appears in Orders, Customer Management and Page Toolbar, and Text Input appears in Customer Management. Surrounding unmigrated surfaces do not gain Dark support automatically.

### Validation

- Token tests: 5 passed; token drift check passed.
- Existing component/story interaction tests and new disabled tests run through Angular unit tests (see delivery report for final counts).
- Baseline suite failure: `app.spec.ts` expects a starter h1 while `app.html` contains only router-outlet; unrelated to component migration.
- Repository formatting check reports pre-existing issues, including generated CSS. Generated files were not hand-formatted. Changed component/story/test/docs files are checked separately.
- Storybook production build uses the documented memory/worker settings with Compodoc disabled to preserve the pre-existing modified documentation.json.
- Browser connection reports no available browser; rendered visual review and story play execution remain pending.

## Selection and date family

Changed Checkbox, Radio, Checkbox Group, Radio Group, Select and Date Input styles; added a Light/Dark comparison story, six native disabled tests and `scripts/component-colours.test.mjs`.

Surfaces, labels, helper/placeholder text, validation and focus follow the text-entry roles above. Checked Radio uses `--color-interactive-default`, independently of its `--color-border-focus` ring. Checkbox check/mixed marks inherit `--color-icon-default`. Invalid focus uses `--color-border-focus-danger`. Disabled controls and icons use text-disabled, bg-subtle and border-default, overriding checked/focus/invalid styling. Group required markers inherit disabled text. Native select options explicitly receive elevated surfaces and primary/disabled text.

No new hover or pressed variants were added. Selection remains native checked/change behaviour. Native select popup appearance is partly platform-controlled and requires visual review. There is no Toggle implementation. Six new tests verify disabled controls and groups cannot focus or activate. The CSS contract tests verify only public semantic names and disabled cascade precedence, substituting unique test colours because jsdom does not resolve custom properties; this is not visual verification. All 11 CSS contract tests pass. Targeted component/story tests pass (38 tests); Storybook build is run before the family commit.

Product effect: Select in Page Toolbar and related screens and Date Input in Customer Management now inherit theme colours. Group and standalone control consumers keep the same API, sizing and events. No template or interaction code changed.

## Feedback family

Changed Alert, Toast and Status Badge styles; added Light/Dark/comparison stories with all tones, actions and long messages. Each tone uses `--color-feedback-{info,success,warning,error}` for status icons, borders and progress and the corresponding `-subtle` role for surfaces. Alert/Toast body text uses text-primary; neutral Badge uses bg-default/text-muted. Dismiss icons inherit text; focus uses border-focus, with border-focus-danger in destructive messages. Toast shadow uses effect-shadow. No timers, outputs, action semantics or dimensions changed. No disabled, loading or pressed variants were introduced to these messages.

CSS contracts check all four Alert/Toast tone combinations and icon inheritance; 14 contract tests pass. Existing Angular dismissal/story tests remain applicable (the full suite has 46 passing tests and the unchanged starter-title failure). Storybook production build is run for this family. Browser visuals remain unavailable. Existing product table status badges inherit new colours; no product layout files were changed.

Separate design gap: Alert currently uses the same info icon for all tones. This colour migration preserves that implementation; it does not claim icon parity with Figma.

## Navigation, pagination and data family

Changed Nav Tab, Sidebar Nav, Top Bar Nav, Page Toolbar, Minimal/Numbered Pagination, Data Table and KPI Card styles, plus Light/Dark/comparison stories. Surfaces use bg-elevated/default; borders use border-default/subtle; text uses primary/secondary/muted. Active tabs, page numbers and notification counts use interactive-default, with text-on-interactive. Neutral avatars pair bg-inverse with text-inverse. Row hover uses bg-subtle; selected rows use interactive-default-opacity-10. KPI positive/negative trends use feedback-success/error and their icons inherit.

Sidebar uses bg-brand/text-on-brand, interactive-on-brand accents and elevated-opacity-10 for hover/active overlays and separators. There are no dedicated on-brand divider or navigation-hover roles: these are purpose-based mappings to the existing overlay role; design review should confirm their contrast. Focus uses border-focus. Disabled anchors are excluded from hover styling, and disabled buttons/anchors/icons override active colours. Numbered Pagination disabled controls override active surfaces. Data Table's clear-selection button now has an explicit semantic focus outline. Existing native interactions and public APIs are preserved; no pressed variants were invented where no separate treatment existed.

The semantic contract suite now covers disabled active sidebar icons and page buttons (16 tests), alongside the existing keyboard/navigation Angular tests. Storybook is built for this family. Rendered hover/focus/contrast review is pending a connected browser. Orders and Customer Management now inherit new component colours across navigation, toolbars, tables, pagination and KPI cards; their own page CSS remains outside the library component migration.

## Chart family

Changed Chart TypeScript/CSS, added a Chart regression test and Light/Dark/comparison stories. Categorical series read `--color-chart-categorical-01` through `06`; gauge remainder uses chart-track; axes/grid/ticks/legend use chart-axis/grid/label. Segment and point borders use bg-elevated. Tooltip surface/text/border use bg-elevated/text-primary/border-default. Removed white fallback literals. Hover retains the semantic series palette instead of allowing Chart.js to manufacture tinted colours; existing point radius and tooltip feedback remain. No keyboard, loading or error variants were introduced.

Canvas reads computed styles on its actual element, so nested theme scopes apply. A MutationObserver redraws when an existing ancestor's data-theme changes and disconnects on destroy. Moving an already-mounted chart between different ancestor trees is not observed; normal Angular mounting or input changes re-read its scope. Tests mock canvas drawing and check semantic configuration, theme-change redraw and cleanup; these do not verify rendered pixels. The full Angular suite has 47 passing tests and the unchanged starter-title failure. Existing product charts will change palette, axis and tooltip appearance and need visual review. Existing chart layout/orientation decisions remain separate design gaps.

## Deferred loading roles and assets

These are explicit remaining migration gaps, not completed families:

- **Skeleton:** its 8% black base and 0/18/55% white shimmer have no dedicated loading roles. Proposed mapping is bg-subtle for the base and bg-elevated-opacity-0/bg-elevated-opacity-10 for a simplified wave, subject to Figma design review; that changes the wave treatment. Current literals are retained rather than manufacturing values or silently treating shadow tokens as loading tokens.
- **Loading Overlay:** overlay-light and scrim are candidate mappings for its web treatments. Its mobile 80% white surface has no matching semantic role. Its existing `theme` input is an explicit treatment API and conflicts with automatic ancestor theme selection; preserve it until a focused compatibility decision is reviewed. No new theme inputs were added anywhere.
- **Spinner:** current SVG background artwork embeds light track and blue arc fills. Proposed semantic mapping is bg-subtle track + interactive-default arc, with an inline SVG or separate masks preserving the existing paths. Background-image SVGs cannot inherit the host's custom properties; this requires an asset/rendering change and rendered review, not an alias substitution.

All other migrated components retain nearest-ancestor CSS theme inheritance. Shared legacy aliases remain for loading components, page example CSS and other external consumers; no global alias remapping occurred. Loading branches of otherwise migrated controls remain dependent on these deferred components.

## Final audit

Disabled supporting/validation copy, Textarea counts, OTP expiry text and Select helper text now use text-disabled when their control is disabled, completing the earlier border/control overrides. User token and documentation changes remain outside migration commits. Live Figma freshness and rendered review remain unverified. No merge, deployment, package publication, accessibility certification or full Figma parity is claimed.

Final verification: `npm run tokens:test` (5 passed), `npm run tokens:check` (182 tokens), `node --test scripts/component-colours.test.mjs` (23 passed), `npx tsc --noEmit -p tsconfig.spec.json` (passed), and Storybook production build (passed with NODE_OPTIONS/NG_BUILD_MAX_WORKERS above and `--compodoc=false`). Final `npm test -- --watch=false`: 47 passed, one pre-existing app starter-title failure. All migration files pass Prettier and `git diff --check`; repository-wide format:check still reports the same 20 baseline files. No connected browser was available, so visual review and browser-only colour play assertions were not executed.

## Subsequent Figma parity batch

The [live parity register](figma-parity-register.md) records a later Button/Text Input comparison with current main definitions. Text Input's blanket disabled label/helper mapping above is superseded by the verified Figma hierarchy (primary label, semantic required marker, secondary helper and strong inside stroke; only native field text is disabled-coloured). Current inset-stroke and geometry changes are a separate parity correction, not part of the original colour-only migration. Other families retain their recorded mappings.

## Sidebar source correction

The [live Sidebar comparison](sidebar-nav-figma-parity.md) supersedes the original Sidebar on-brand mappings in the navigation section. Current Figma main instances use bg-elevated/text-primary, border-default, feedback-info-subtle parent states, interactive-default accents and icon-default active icons. Other navigation/data components retain their earlier mappings. This follow-up also corrects Sidebar anatomy and adds its secondary menu slot; token migration alone did not establish those details.
