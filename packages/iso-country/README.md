# @poh8479/iso-country

[![version](https://img.shields.io/github/package-json/v/POH8479/toolbox?filename=packages%2Fiso-country%2Fpackage.json&label=%40poh8479%2Fiso-country)](packages/iso-country)
[![Changesets](https://img.shields.io/badge/release-Changesets-5b3fe2)](https://github.com/changesets/changesets)
[![License](https://img.shields.io/badge/license-MIT-blue)](packages/iso-country/LICENSE)

ISO 3166-1 alpha-2 utilities (Zod v4): strict validation, code - name, emoji flags, and search.  
Tiny, tree-shakeable, and framework-agnostic.

## Install

```sh
pnpm add @poh8479/iso-country zod
```

## API

### Validation

```ts
import { CountryCodeSchema, CountryCodeInputSchema } from "@poh8479/iso-country";

CountryCodeSchema.parse("NL"); // "NL"
CountryCodeInputSchema.parse("nl"); // "NL"
```

### Lookups

```ts
import { codeToName, nameToCode, codeToFlagEmoji } from "@poh8479/iso-country";

codeToName("NL"); // "Netherlands"
nameToCode("côte d’ivoire"); // "CI"
codeToFlagEmoji("NL"); // "🇳🇱"
```

### Lists & Search

```ts
import { ALL_COUNTRIES, searchCountries } from "@poh8479/iso-country";

ALL_COUNTRIES[0]; // { code: "AD", name: "Andorra", flag: "🇦🇩" }
searchCountries("united"); // United Kingdom, United States, etc.
```

## Types

```ts
import type { CountryCode, CountryName } from "@poh8479/iso-country";
```

## Notes

- Uses Zod v4 for validation.
- Country names are English.
- Emoji flags rely on regional indicator symbols.
