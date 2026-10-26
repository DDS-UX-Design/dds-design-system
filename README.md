# DDS Design System

This repository contains the DDS Design System, a lightweight Angular-based component library with Storybook documentation and visual review workflows.

## Overview

The system includes:

- reusable UI primitives such as buttons and icons
- token-driven styling for colors, spacing, radius, and typography
- Storybook documentation for component exploration and review
- Chromatic integration for visual regression testing and design review

## Prerequisites

Make sure you have the following installed:

- Node.js 20 or newer
- npm 10 or newer

## Clone and install

```bash
git clone <repository-url>
cd dds-design-system
npm install
```

## Run the app locally

Start the Angular development server:

```bash
npm start
```

Then open http://localhost:4200/ in your browser.

## Run Storybook

To explore and document components locally:

```bash
npm run storybook
```

Storybook will open in your browser and load the component stories from the project.

The sidebar groups stories by how you use them:

- **Foundations**: design tokens, typography, icons and theme comparisons.
- **Building Blocks**: focused controls grouped by Actions, Forms, Feedback, Navigation and Disclosure.
- **Compositions**: coordinated components such as grouped fields, navigation bars, toolbars and data tables.
- **Patterns, Layouts and Pages**: workflow examples, reusable page arrangements and complete screens, where available.
- **Experimental**: components whose design or implementation is still being evaluated.

Give each component one canonical location. Classify it by its purpose for consumers, rather than the number of components it imports.

## Build the project

Create a production build of the Angular app:

```bash
npm run build
```

## Run tests

Run the unit test suite:

```bash
npm test
```

## Format the project

Format supported source and configuration files:

```bash
npm run format
```

Check formatting without changing files:

```bash
npm run format:check
```

## Publish to Chromatic

Chromatic is used to publish Storybook builds for visual review and regression tracking.

### Build Storybook for Chromatic

```bash
npm run build-storybook
```

### Publish the build

```bash
export CHROMATIC_PROJECT_TOKEN=<your-project-token>
npm run chromatic
```

### Continuous visual testing

The `Visual tests` GitHub Actions workflow publishes Storybook to Chromatic on every push. Chromatic then reports UI Tests, Storybook Publish, and—when enabled for the project—UI Review checks on related pull requests.

Repository setup required:

1. Rotate the Chromatic project token previously stored in this repository.
2. In GitHub, add the rotated token as an Actions repository secret named `CHROMATIC_PROJECT_TOKEN`.
3. In Chromatic under **Manage → Configure**, connect this GitHub repository and enable UI Tests and UI Review.
4. Optionally require the Chromatic checks in the GitHub branch protection rules for `main`.

The workflow uses push events because Chromatic uses branch commit history to select reliable visual baselines. Pull requests from forks do not receive repository secrets and therefore require a separate security decision before they can publish builds.

## Contribution workflow

When you update or add a component:

1. Create or update the Angular component in src/app/components.
2. Add or refine its Storybook stories in src/stories.
3. Verify the change locally with npm start or npm run storybook.
4. Run npm run build to ensure the app still compiles.
5. Push the branch to publish a Chromatic review and receive pull-request status checks.

## Project structure highlights

- src/app/components: reusable Angular components
- src/stories: Storybook stories for component documentation
- src/tokens: design tokens for primitive and semantic styles

## Figma token pipeline

Current Figma colours, spacing and radius are versioned in `tokens/figma.snapshot.json`. Run `npm run tokens:build` to generate CSS, and `npm run tokens:check` to detect drift. Preview Light/Dark under **Foundations / Semantic Tokens** in Storybook.

See [the export and review workflow](docs/token-pipeline.md) for updating the snapshot, account-access requirements and component migration limits.
