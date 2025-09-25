# Toolbox

A personal monorepo by Pieter O’Hearn containing reusable libraries and utilities.
This is where I collect packages I use across my projects (web, mobile, backend).

The goal is to keep them:

- Well-typed (TypeScript everywhere)
- Small & focused (each package solves one problem well)
- Reusable across apps, APIs, and experiments

## 📦 Packages

## Development

Clone and install:

```bash
git clone git@github.com:POH8479/toolbox.git
cd toolbox
pnpm install
```

Build all packages:

```bash
pnpm -r build
```

Run tests:

```bash
pnpm -r test
```

## Releasing

We use Changesets:

1. Add a changeset when you make changes:

   ```bash
   pnpm changeset
   ```

   Choose packages + bump type, write release notes.

2. Preview upcoming changes:

   ```bash
   pnpm changeset status --verbose
   ```

3. Merge the Release PR created by CI → versions + changelogs update automatically.

## Naming

All packages are published under the npm scope @poh8479/\*.
