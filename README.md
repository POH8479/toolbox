# Toolbox

[![CI](https://github.com/POH8479/toolbox/actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

A personal monorepo by Pieter O’Hearn containing reusable libraries and utilities.
This is where I collect packages I use across my projects (web, mobile, backend).

The goal is to keep them:

- Well-typed
- Small & focused (each package solves one problem well)
- Reusable across apps, APIs, and experiments

## 📦 Packages

| Package                                          | Description                                                                           | Install                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------- |
| **[@poh8479/iso-country](packages/iso-country)** | ISO 3166-1 alpha-2 utilities (Zod v4): validation, code to name, emoji flags, search. | `pnpm add @poh8479/iso-country` |

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
