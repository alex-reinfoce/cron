# Publishing Guide

This document explains how to publish the `cron` CLI tool to npm.

## Overview

The `@alex-programmer/cron` CLI tool helps users create and manage cron task management platforms. When published, users can run:

```bash
npx @alex-programmer/cron create my-project
```

## Prerequisites

1. Make sure you have an npm account and are logged in:
   ```bash
   npm login
   ```

2. Ensure you have the necessary permissions to publish the package.

## Before Publishing

### 1. Update Version

Update the version in `package.json`:

```json
{
  "name": "@alex-programmer/cron",
  "version": "1.0.1"
}
```

### 2. Test CLI Locally

Build and test the CLI locally:

```bash
npm run build-cli
node dist/cli.js create test-project
```

### 3. Test Template Generation

Verify that projects are created correctly:

```bash
node /path/to/cron/dist/cli.js create test-project
cd test-project
npm install
npm run dev
```

## Publishing Steps

### 1. Login to npm

```bash
npm login
```

### 2. Build CLI

```bash
npm run build-cli
```

### 3. Publish

```bash
npm publish
```

## Testing Published Package

After publishing, test the published package:

```bash
npx cron@latest create test-published-project
cd test-published-project
npm install
npm run dev
```

## Package Structure

The published package includes:

- `dist/` - Compiled CLI code
- `templates/` - Project templates
- `README.md` - Documentation

## Files Excluded

The following are automatically excluded:
- Source code (`cli/`, `app/`, `components/`, etc.)
- Development dependencies
- Test files
- Build artifacts (`.next/`, `node_modules/`, etc.)
- Database files (`*.db`)

## Version Management

- Update `package.json` version before each publish
- The `.cron-version` file in generated projects tracks the CLI version used to create them
- The upgrade command uses this file to determine compatibility

## Troubleshooting

### Build Errors
If you encounter TypeScript build errors:
```bash
pnpm run build-cli
```

### Template Issues
If template files are outdated:
```bash
pnpm run update-template
```

### Permission Issues
Make sure you're logged into npm and have publish permissions:
```bash
npm whoami
npm access list packages
```

## Notes

- The package is scoped to `@alex-programmer/cron`
- The CLI is available as `cron` command when installed globally
- Templates are copied from the `templates/` directory during project creation 
