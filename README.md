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

## Publish to Chromatic

Chromatic is used to publish Storybook builds for visual review and regression tracking.

### Build Storybook for Chromatic

```bash
npm run build-storybook
```

### Publish the build

```bash
npm run chromatic
```

If you need to publish with a different token, you can also run:

```bash
npx chromatic --project-token=<your-project-token>
```

## Contribution workflow

When you update or add a component:

1. Create or update the Angular component in src/app/components.
2. Add or refine its Storybook stories in src/stories.
3. Verify the change locally with npm start or npm run storybook.
4. Run npm run build to ensure the app still compiles.
5. Publish a Chromatic review with npm run chromatic when the visual change should be reviewed.

## Project structure highlights

- src/app/components: reusable Angular components
- src/stories: Storybook stories for component documentation
- src/tokens: design tokens for primitive and semantic styles
