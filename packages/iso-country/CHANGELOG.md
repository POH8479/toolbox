# @Pieter-OHearn/iso-country

## 0.2.0

### Minor Changes

- [`a99513b`](https://github.com/POH8479/toolbox/commit/a99513b2501fad18693772340b0c09b07112f81a) - feat(iso-country): add CountryName type and schema
  - Introduce `CountryName` type derived from ISO country mapping
  - Add `CountryNameSchema` Zod enum for strict validation of country names
  - Strengthen typings with `as const satisfies Record<CountryCode, string>`
  - Update `ALL_COUNTRIES` and utils to use `CountryName` instead of plain string
  - Export `CountryNameSchema` in package index
  - Update README with usage examples for `CountryName` and `CountryNameSchema`

## 0.1.0

### Minor Changes

- [`f4c1447`](https://github.com/POH8479/toolbox/commit/f4c1447696a8ef56111603f3d346b786c49c4468) - Initial release: ISO 3166-1 alpha-2 validation + name/flag helpers.
