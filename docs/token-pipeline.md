# DDS token delivery: milestone 1

Figma is the value source. Git is the reviewed delivery record. The committed snapshot contains 78 semantic colours, 84 colour primitives, 11 spacing tokens and nine radius tokens from the DDS file. Typography and elevation are outside this first milestone; elevation still needs a defined foundation.

## Update tokens without REST access

1. In Figma desktop, create a local development plugin (Plugins → Development → New plugin) so Figma assigns its ID. Copy `tokens/exporter/code.js` into that plugin folder and apply the settings from `tokens/exporter/manifest.json`, retaining the generated `id`. Run it in the DDS file. It reads variables only and makes no network requests.
2. Download `dds-figma-export.json` from its window.
3. On a feature branch, run:

   ```bash
   npm run tokens:sync -- /path/to/dds-figma-export.json
   npm run tokens:build
   npm run tokens:test
   npm run tokens:check
   npm run build-storybook
   ```

4. Review the snapshot and generated diff, including both theme stories under **Foundations / Semantic Tokens**. Open a PR and obtain design/engineering review. Merge and release through the team's normal process. This milestone does not publish an npm package or automatically merge changes.
5. Consumers use the generated CSS; never edit generated files by hand. The app and Storybook receive it through `src/styles.css`.

`tokens:sync` validates the entire input before replacing the snapshot. It stops on removed or renamed variables; after documenting the migration, use `--allow-breaking`. Review CSS-code-syntax changes as breaking API changes too.

## Optional REST import

If your Figma account supports the Variables REST API, set `FIGMA_ACCESS_TOKEN` in your environment with `file_variables:read`, then run `npm run tokens:sync -- --rest`. Never commit credentials. The local variables endpoint is restricted by Figma account/plan permissions; the file exporter above remains the baseline path. See https://developers.figma.com/docs/rest-api/variables-endpoints/.

## Generated files and compatibility

- `tokens/figma.snapshot.json`: versioned source, preserving IDs, aliases and modes.
- `src/tokens/generated/figma.tokens.css`: private primitive variables, public semantic variables, spacing and radius. Light is the default; `[data-theme="dark"]` selects Dark.
- `src/tokens/generated/figma.tokens.json`: resolved Light/Dark values for tooling and the gallery.
- Existing component CSS retains its legacy names. No legacy colour variables are remapped in this milestone. New semantic variables are available for incremental migration.
- Spacing/radius reuse existing CSS names and currently match their existing values. The Figma typo `raduis-3xl` is normalized to the existing code name `--radius-3xl`; the source name is preserved in the snapshot. Future changes to these dimensions affect existing consumers and require visual review.
- Ordinary colour aliases remain CSS `var()` references. Composed alpha colours are resolved to valid CSS colours; their alias structure remains in the source snapshot.

## What CI verifies

Token integrity validates aliases, cycles, mode coverage, values and CSS name collisions. It regenerates in memory and fails when committed output is stale. Tests prove that changing a source value changes generated CSS and reverting restores it. Existing Chromatic checks provide visual review when configured.

CI does not poll live Figma: a passing check proves committed source/output agreement, not that the snapshot is the latest Figma version. Each approved design change must include a fresh export. Scheduled synchronization and automatic PR creation can be a later milestone.

## Prove the loop before promotion

On a test branch, change one non-critical semantic value in Figma, export, sync and build; compare Light/Dark gallery snapshots, then revert the Figma change and repeat. Keep both sides consistent. The local automated test covers generation/reversion; live design-change approval, Chromatic review and downstream product rollout still require team verification.
