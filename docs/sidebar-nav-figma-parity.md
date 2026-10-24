# Sidebar Nav correction against current Figma

Inspected live Figma on 24 October 2026: [main set](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=1805-409), [expanded main](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=364-4043), [collapsed main](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=1805-247), [Light](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=2112-581) and [Dark](https://www.figma.com/design/u0lpCPrGMj68e9RMIRuYxL?node-id=2112-742). High-fidelity contexts and renders were also inspected for parent Default/Hover/Active and child Default/Hover/Active. [Read-only binding/layout evidence](sidebar-nav-figma-evidence.json) records the current source. Code Connect mapping returned empty; the existing Angular component was reused.

## Confirmed mismatch and correction

The earlier semantic migration used a dark brand surface and on-brand colours. Those mappings do not match the current Sidebar main definitions. This correction uses their elevated surface and primary text, not a recoloured approximation of the former branded sidebar.

| Purpose                                              | Current generated role / anatomy                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Sidebar, header, footer and submenu surfaces         | `--color-bg-elevated`                                                                                 |
| Parent/child labels and footer                       | `--color-text-primary`                                                                                |
| Header/footer/right-edge and secondary-list dividers | `--color-border-default`                                                                              |
| Default/hover parent icons and disclosure            | `--color-interactive-default`                                                                         |
| Active parent icons/disclosure and toggle            | `--color-icon-default`                                                                                |
| Parent hover and active surface                      | `--color-feedback-info-subtle`                                                                        |
| Child hover/active text                              | `--color-interactive-default`                                                                         |
| Focus                                                | `--color-border-focus`; forced colours use Highlight                                                  |
| Disabled extension                                   | text-disabled / transparent; overrides active and hover                                               |
| Frame                                                | 250px expanded / 72px collapsed; consumer-controlled height; source stories 790px                     |
| Header/footer                                        | 65px; 16px horizontal inset; logo 23×24px; toggle 24×24px                                             |
| Body                                                 | 20px outer vertical padding; 8px between parent rows; secondary divider with 20px surrounding spacing |
| Parent row                                           | 48px; 16px horizontal inset; 20px icon; 14px/20px regular text, active 600                            |
| Submenu                                              | 8px separation from parent; no gaps between 36px child rows; 44px child horizontal inset              |

The reusable blank Sidebar Nav Container component has 16px horizontal placeholder padding; the actual expanded/collapsed Sidebar main instances override that to zero so rows span the frame. The implementation follows those current main instances and their documented Light/Dark examples. This distinction is recorded rather than interpreting the blank placeholder as the application anatomy.

## API and behaviour

Existing inputs, outputs, selection, links, collapse/expand and logo projection are retained. Added optional `bottomItems: SidebarNavItem[] = []` maps the current Figma Bottom Menu Items slot. Both lists share the same item renderer and interaction handlers. Existing consumers passing only items continue to work; no items were silently reclassified.

The default Light logo was downloaded unchanged from the main Figma export to `public/images/dds-brand-icon-light.svg`. The existing `dds-brand-icon.svg` exactly matches the current Dark export. SHA-256 checks verified both local assets against the downloads; both exports are 23×24px. Only the default artwork switches using the nearest data-theme scope; custom logoSrc values and projected logos are preserved. No theme input was added. A local observer handles ancestor theme-attribute changes and disconnects on destruction. Reparenting an already-mounted host into a different ancestor tree is not observed until remounting; this remains a lifecycle limit.

Disabled controls cannot activate. Native buttons retain keyboard activation; disclosure controls retain expanded/controls relationships; selected destinations retain aria-current. Escape now dismisses pointer-triggered collapsed tooltips even when focus remains on the toggle. Figma defines no disabled, loading or pressed Sidebar variants; no speculative variants were added. Tooltip styling and explicit keyboard/forced-colour focus remain implementation accessibility treatments, not claimed Figma variants.

## Review and evidence

Review **Components / Navigation / Sidebar Nav / Figma Parity**: Light, Dark, Collapsed Light, Collapsed Dark, Light Interactions, Dark Interactions and Long Content. Static stories preserve the source frame state; interaction stories exercise actual pointer hover, keyboard toggle, child selection preservation, tooltip dismissal, dimensions, icon size, source offsets and semantic roles. They compile in Storybook; browser-only play assertions have not been executed. Existing Sidebar stories and product examples inherit the corrected appearance.

- Affected Angular suite: **51 passed**, excluding the unrelated starter app heading test (`npm test -- --watch=false --exclude=src/app/app.spec.ts`). Regression tests cover existing collapse/selection plus secondary-list selection/disabled behaviour, nearest nested theme/logo changes and Escape dismissal.
- Token tests: **5 passed**. Token drift check: **182 validated**. Semantic CSS contracts: **24 passed**, including the current Sidebar surface, dividers, active icon and child roles. jsdom contracts substitute distinct test colours and are not rendered visual evidence.
- Final Storybook production build passed with the documented memory/worker settings and `--compodoc=false`, preserving the existing modified documentation.json.
- Angular production build passed outside the sandbox, including prerendering. Stylesheet warning budgets remain for Sidebar (4.58 kB), Button and the typography page; no hard budget failed.
- TypeScript no-emit check passed. Changed files pass formatting and diff whitespace checks; repository-wide formatting still reports 20 baseline files. Generated token files were not manually edited.
- Browser discovery reported no connected browser. Matching-viewport render comparison, font rasterisation, actual SVG/icon geometry, focus/hover screenshots and long-content/scroll visual review remain pending. Status remains **partial**, not matched.

Orders and Customer Management sidebars now change from brand-dark to the current theme's elevated surface, including navigation state colours and spacing. Their surrounding page layout is unchanged; review those screens before rollout. Public APIs have no removals or renames. No merge, deployment or package publication occurred.
