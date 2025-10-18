# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue Email is a library for building email templates using Vue.js components. The project is structured as a **Turborepo monorepo** containing multiple packages that work together to provide email template functionality.

## Repository Structure

- **Monorepo**: Uses Turborepo with pnpm workspaces
- **Core packages**:
  - `@vue-email/render` - Transforms Vue components into HTML email templates (supports both Node.js and browser environments)
  - `@vue-email/components` - Collection of all Vue Email components, re-exports individual component packages
- **Individual component packages**: Each email component (body, button, container, etc.) is its own package in `packages/`
- **Build tooling**: Uses tsup for building packages with dual Node.js/browser exports

## Development Commands

### Setup
```bash
# Install dependencies (requires pnpm)
pnpm install
```

### Build & Development
```bash
# Build all packages
pnpm build
# or
turbo run build

# Start development mode for all packages
pnpm dev
# or
turbo run dev --parallel --concurrency 25

# Clean all build artifacts
pnpm clean
# or
turbo run clean
```

### Testing
```bash
# Run all tests
pnpm test
# or
turbo run test

# Run tests in watch mode
pnpm test:watch
# or
turbo run test:watch
```

### Code Quality
```bash
# Lint all packages
pnpm lint
# or
turbo run lint

# Format code
pnpm format

# Check formatting
pnpm format:check
```

## Architecture Notes

### Package Dependencies
- The `@vue-email/components` package depends on all individual component packages and re-exports them
- The `@vue-email/render` package is the core rendering engine and is also exported by components
- Each component package is independently versioned and published

### Build System
- Uses **tsup** for TypeScript compilation and bundling
- Supports dual exports for Node.js and browser environments
- The render package has separate build targets for `node/` and `browser/` with different entry points
- Turbo handles dependency management and parallel builds across packages

### Testing
- Uses **Vitest** with happy-dom environment for testing
- Global test configuration in root `vitest.config.ts`
- Workspace configuration in `vitest.workspace.ts`

### Package Manager
- **pnpm 9.1.1** is required (specified in packageManager field)
- Contains custom patches for some dependencies (postcss-css-variables, process, tailwindcss)

## Key Files for Development

- `turbo.json` - Turborepo task configuration
- `pnpm-workspace.yaml` - Workspace configuration
- `packages/render/` - Core rendering functionality
- `packages/components/` - Main components entry point
- Individual component packages in `packages/[component-name]/`
