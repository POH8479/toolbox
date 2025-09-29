---
"@poh8479/iso-country": minor
---

feat(iso-country): add CountryName type and schema

- Introduce `CountryName` type derived from ISO country mapping
- Add `CountryNameSchema` Zod enum for strict validation of country names
- Strengthen typings with `as const satisfies Record<CountryCode, string>`
- Update `ALL_COUNTRIES` and utils to use `CountryName` instead of plain string
- Export `CountryNameSchema` in package index
- Update README with usage examples for `CountryName` and `CountryNameSchema`
