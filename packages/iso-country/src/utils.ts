import type { CountryCode } from "./constants";
import { COUNTRY_NAME_BY_CODE, ISO_ALPHA2_CODES } from "./constants";

/** Country name type (string). Provided for convenience. */
export type CountryName = (typeof COUNTRY_NAME_BY_CODE)[CountryCode];

/** ASCII-fold + case-insensitive slug for names, cities, etc. */
export function slugifyName(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Convert a valid code to its English name. */
export function codeToName(code: CountryCode): CountryName {
  return COUNTRY_NAME_BY_CODE[code];
}

/** Precomputed map of slug(name) -> code for fast lookup. */
const CODE_BY_NAME_SLUG: Record<string, CountryCode> = Object.fromEntries(
  (Object.entries(COUNTRY_NAME_BY_CODE) as [CountryCode, string][]).map(([code, name]) => [
    slugifyName(name),
    code,
  ]),
);

/** Lookup country code by (accent/case-insensitive) name. */
export function nameToCode(name: string): CountryCode | null {
  const slug = slugifyName(name);
  return CODE_BY_NAME_SLUG[slug] ?? null;
}

/** Convert code to flag emoji (regional indicator symbols). */
export function codeToFlagEmoji(code: CountryCode): string {
  const base = 0x1f1e6;
  return String.fromCodePoint(base + (code.charCodeAt(0) - 65), base + (code.charCodeAt(1) - 65));
}

export const ALL_COUNTRIES: { code: CountryCode; name: string; flag: string }[] =
  ISO_ALPHA2_CODES.map((code) => ({
    code,
    name: COUNTRY_NAME_BY_CODE[code],
    flag: codeToFlagEmoji(code),
  }));

/** Simple name substring search (accent/case-insensitive). */
export function searchCountries(query: string) {
  const q = slugifyName(query);
  return ALL_COUNTRIES.filter((c) => slugifyName(c.name).includes(q));
}
