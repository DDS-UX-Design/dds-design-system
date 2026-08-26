# Figma Design Backlog

This file tracks missing, incomplete, or undecided Figma specifications discovered while implementing and documenting the DDS Design System in Storybook.

Last audited: 27 August 2026

## How to use this backlog

- **Confirmed gap** means the current Figma component set was inspected and does not specify the listed behavior or state.
- **Design review** means Storybook or the coded component exposes a decision that should be confirmed and documented in Figma.
- Priority uses **P0** (blocks safe use), **P1** (important common behavior), **P2** (valuable completeness), and **P3** (polish or guidance).
- Mark completed work by changing `[ ]` to `[x]` and add the Figma node or decision beside it.
- When a component is added or compared with Figma, record newly discovered gaps here in the same change.

## Cross-component foundations

- [ ] **P1 · Design review** — Define shared loading conventions: spinner placement, loading labels, disabled behavior, and whether existing content remains visible.
- [ ] **P1 · Design review** — Define shared validation states across form controls: error, warning, success, disabled, and read-only.
- [ ] **P1 · Design review** — Add elevation tokens and document their usage. Dropdowns and Toasts currently use the same `0 4px 16px rgb(0 0 0 / 8%)` shadow without a named design token.
- [ ] **P1 · Design review** — Add motion tokens for durations and easing, including reduced-motion behavior. Toast countdown and component transitions currently have component-level values.
- [ ] **P2 · Design review** — Define responsive rules for component widths, wrapping, and breakpoint behavior instead of only Desktop/Mobile snapshots.
- [ ] **P2 · Design review** — Document minimum touch-target guidance for interactive icons and compact controls.
- [ ] **P2 · Design review** — Document focus-ring construction and application across all interactive components.
- [ ] **P2 · Design review** — Add content guidance for truncation, wrapping, and unusually long translated text.

## Forms

### Search

Figma reference: [Search — node 2:1287](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL/DDS---Design-System-v1.0?node-id=2-1287)

- [ ] **P0 · Confirmed gap** — Add a Loading state for asynchronous suggestions or results.
- [ ] **P0 · Confirmed gap** — Add No results and request-error treatments for the suggestion menu.
- [ ] **P1 · Confirmed gap** — Add Disabled and read-only states.
- [ ] **P1 · Confirmed gap** — Specify a clear-query control, including its visibility, icon size, focus, hover, and accessible label.
- [ ] **P1 · Confirmed gap** — Specify keyboard-highlighted and selected suggestion states rather than relying only on a generic hover row.
- [ ] **P1 · Design review** — Decide whether suggestions open on focus, only after typing, or after a minimum query length.
- [ ] **P1 · Design review** — Define submit behavior: Enter-only, an explicit Search button, or both.
- [ ] **P2 · Confirmed gap** — Define long and multi-line suggestion content, truncation, and optional supporting metadata.
- [ ] **P2 · Confirmed gap** — Define mobile suggestion-menu height, viewport collision, scrolling, and keyboard behavior.
- [ ] **P2 · Design review** — Define maximum visible results and whether a “View all results” row is needed.
- [ ] **P3 · Design review** — Reconsider making Search required by default; most search experiences allow an empty query or simply disable submission.

### OTP Input

Figma reference: [OTP Input — node 2:968](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL/DDS---Design-System-v1.0?node-id=2-968)

- [ ] **P0 · Confirmed gap** — Add an explicit Resend code action and its enabled, disabled, loading, cooldown, and failure states.
- [ ] **P1 · Confirmed gap** — Give Disabled/Loading visible feedback such as a spinner and “Verifying code…” status instead of disabled styling alone.
- [ ] **P1 · Design review** — Specify incomplete-code, incorrect-code, expired-code, and verification-failure messages separately.
- [ ] **P1 · Design review** — Define whether completion submits automatically or only enables a separate verification action.
- [ ] **P1 · Design review** — Add contextual guidance such as “Enter the six-digit code sent to •••• 1234,” including privacy-safe masking.
- [ ] **P2 · Confirmed gap** — Document full-code paste and mobile one-time-code autofill behavior.
- [ ] **P2 · Design review** — Define countdown accessibility: avoid announcing every second and announce only meaningful expiry milestones.
- [ ] **P2 · Design review** — Specify behavior when a new code is requested while a previous code or error is displayed.
- [ ] **P3 · Design review** — Confirm whether codes must always contain six numeric digits or whether length and character set will vary by product.

### Password Input

- [ ] **P1 · Design review** — Add read-only, success, and loading states if the field can participate in asynchronous validation.
- [ ] **P1 · Design review** — Define password-strength feedback, requirements, and when each requirement becomes visible for new-password flows.
- [ ] **P2 · Design review** — Specify helper text independently from error text.
- [ ] **P2 · Design review** — Document browser autofill and password-manager presentation, including how filled styling should look.
- [ ] **P2 · Design review** — Confirm hover, pressed, and focus treatments for the visibility control.
- [ ] **P3 · Design review** — Define behavior for long error messages and translated labels on Mobile.

### Select

Figma reference: [Select — node 2:1098](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL/DDS---Design-System-v1.0?node-id=2-1098)

- [ ] **P0 · Confirmed gap** — Design the opened menu, including its elevation, maximum height, scrolling, and viewport collision behavior.
- [ ] **P1 · Confirmed gap** — Add option states for hover, keyboard focus, selected, disabled, and pressed.
- [ ] **P1 · Design review** — Decide whether DDS Select remains native or requires a custom listbox for richer content and consistent cross-platform menu styling.
- [ ] **P1 · Confirmed gap** — Define loading, empty-options, and option-loading-failure states for dynamically populated selects.
- [ ] **P2 · Confirmed gap** — Define long option labels, truncation or wrapping, and localized content.
- [ ] **P2 · Design review** — Define option groups, separators, and supporting descriptions if they are allowed.
- [ ] **P2 · Design review** — Decide whether a clear/reset option is supported for optional fields after a selection is made.
- [ ] **P2 · Confirmed gap** — Specify Mobile menu behavior and whether it may use the platform-native picker.
- [ ] **P3 · Design review** — Clarify placeholder behavior when the field is disabled and when a required field has not been selected.

### Textarea

Figma reference: [Textarea — node 28:1043](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL/DDS---Design-System-v1.0?node-id=28-1043)

- [ ] **P1 · Confirmed gap** — Define vertical resize behavior, including minimum and maximum heights and whether resizing is disabled in any product context.
- [ ] **P1 · Design review** — Specify validation timing for required fields and character limits: on input, blur, form submission, or a combination.
- [ ] **P1 · Confirmed gap** — Define character-counter warning and limit-reached treatments, including color, messaging, and screen-reader announcements.
- [ ] **P2 · Design review** — Confirm whether the counter shows characters used (`75/150`) or characters remaining and whether spaces and line breaks count.
- [ ] **P2 · Confirmed gap** — Add success, read-only, loading, and warning states or explicitly rule them out.
- [ ] **P2 · Confirmed gap** — Specify behavior for pasted content that exceeds the maximum length and content restored by browser autofill.
- [ ] **P2 · Confirmed gap** — Define long helper and error text, localized labels, and narrow-screen wrapping.
- [ ] **P3 · Design review** — Document when spellcheck, autocomplete, and browser writing-assistance features should be enabled.
- [ ] **P3 · Design review** — Clarify whether Large and Small change only typography or should also have different minimum heights and padding.

## Feedback

### Alert

Figma reference: [Alert — node 638:5265](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL/DDS---Design-System-v1.0?node-id=638-5265)

- [ ] **P1 · Design review** — Define when alerts are persistent versus dismissible for each semantic tone.
- [ ] **P1 · Design review** — Confirm whether every tone intentionally uses the Info glyph or should use tone-specific Warning, Success, and Danger icons.
- [ ] **P1 · Confirmed gap** — Specify layout and wrapping when both an action and dismiss control are present on narrow screens.
- [ ] **P2 · Design review** — Decide whether alerts support an optional title and multi-paragraph content.
- [ ] **P2 · Confirmed gap** — Add examples for long content, links, multiple actions, and localized text.
- [ ] **P2 · Design review** — Define announcement behavior for alerts inserted dynamically versus alerts already present when a page loads.
- [ ] **P3 · Design review** — Clarify whether Mobile is a distinct size prop or a responsive adaptation of the Web component.

### Toast

Figma reference: [Toast — node 638:5372](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL/DDS---Design-System-v1.0?node-id=638-5372)

- [ ] **P0 · Design review** — Define toast placement, stacking direction, spacing, maximum visible count, and overflow/queue behavior.
- [ ] **P1 · Design review** — Confirm the timed-dismissal policy: Info and Success automatically dismiss; Warning and Danger remain until closed.
- [ ] **P1 · Confirmed gap** — Add the progress-bar specification: height, inset, color, duration, direction, and behavior at zero.
- [ ] **P1 · Confirmed gap** — Define whether countdown pauses on pointer hover, keyboard focus, or window/tab inactivity.
- [ ] **P1 · Confirmed gap** — Add toast enter, exit, and stack-reflow motion, including reduced-motion alternatives.
- [ ] **P1 · Design review** — Decide whether Info and Success retain the X control in addition to timed dismissal.
- [ ] **P2 · Confirmed gap** — Define responsive width and placement on small screens.
- [ ] **P2 · Design review** — Decide whether Toast supports an action and how it differs from an actionable Alert.
- [ ] **P2 · Confirmed gap** — Add long-message, title-hidden, and localization examples to the Figma component set.
- [ ] **P2 · Design review** — Define screen-reader announcement priority for each tone and repeated notifications.

## Actions

### Button

Figma reference: [Button — node 15:358](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL/DDS---Design-System-v1.0?node-id=15-358)

- [ ] **P1 · Confirmed gap** — Add a Loading state, including spinner placement for text, icon, and icon-only buttons and whether the original label remains visible.
- [ ] **P1 · Design review** — Add or explicitly rule out a pressed/active state separate from Hover and Focus.
- [ ] **P1 · Design review** — Add the Ghost keyboard-focus state to Figma; the code retains visible focus for accessibility even though the current Figma set omits it.
- [ ] **P2 · Design review** — Confirm whether Danger is a semantic style of Primary or a first-class variant in naming and design documentation.
- [ ] **P2 · Design review** — Define minimum-width, long-label, wrapping, truncation, and localization behavior.
- [ ] **P2 · Design review** — Document supported icon-only actions and tooltip expectations.
- [ ] **P3 · Design review** — Specify full-width behavior across breakpoints.

## Navigation

### Numbered Pagination

- [ ] **P1 · Design review** — Define responsive behavior when page numbers cannot fit, including the Mobile presentation.
- [ ] **P1 · Design review** — Confirm the ellipsis algorithm for beginning, middle, and end positions and whether ellipses are interactive.
- [ ] **P2 · Design review** — Add hover, focus, pressed, current, and disabled state specifications for every control type.
- [ ] **P2 · Design review** — Define behavior while page data is loading and whether navigation remains enabled.
- [ ] **P2 · Design review** — Specify whether Previous/Next use icons only or labels at different breakpoints.
- [ ] **P3 · Design review** — Define optional total-item or result-range information, such as “21–40 of 184.”

### Minimal Pagination

- [ ] **P1 · Design review** — Define Mobile wrapping or stacking for Previous, status text, and Next.
- [ ] **P2 · Design review** — Specify loading behavior after Previous or Next is activated.
- [ ] **P2 · Design review** — Confirm whether “Page X of Y” is always visible and how large totals are displayed.
- [ ] **P3 · Design review** — Define an optional compact/icon-only treatment if minimal pagination is used in narrow containers.

## Foundations

### Colour

- [ ] **P1 · Design review** — Add documented contrast results for semantic foreground/background combinations and interactive states.
- [ ] **P2 · Design review** — Define dark-theme semantic mappings if a product dark theme is planned.
- [ ] **P2 · Design review** — Document when primitives may be used directly versus semantic tokens only.

### Typography

- [ ] **P1 · Design review** — Define responsive typography behavior for display and heading styles.
- [ ] **P2 · Design review** — Document maximum line lengths, paragraph spacing, and truncation guidance.
- [ ] **P2 · Design review** — Define fallback behavior when Inter is unavailable or still loading.

### Spacing and layout

- [ ] **P2 · Design review** — Document layout/container tokens in addition to the current spacing scale.
- [ ] **P2 · Design review** — Define responsive gutters and common content widths.
- [ ] **P3 · Design review** — Add guidance for choosing between adjacent spacing values in common component and page patterns.

### Icons

- [ ] **P1 · Design review** — Establish a Figma-to-code icon parity check so icon names and available glyphs stay synchronized.
- [ ] **P2 · Design review** — Document approved sizes, stroke widths, optical alignment, and semantic colors.
- [ ] **P2 · Design review** — Define when an icon requires a visible label, tooltip, or accessible name.

## Future maintenance

For every future Figma-to-Storybook task:

1. Compare the inspected Figma node with the implemented API, states, responsive behavior, accessibility, and realistic edge cases.
2. Add confirmed gaps and unresolved design decisions to this file.
3. Link the relevant Figma node when available.
4. Remove or mark items complete only after the design decision is represented in Figma.
