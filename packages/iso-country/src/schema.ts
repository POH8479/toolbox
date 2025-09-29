import { z } from "zod";
import { COUNTRY_NAME_BY_CODE, ISO_ALPHA2_CODES } from "./constants";
import type { CountryName } from "./constants";

/** Strict ISO 3166-1 alpha-2 code (uppercase). */
export const CountryCodeSchema = z.enum(ISO_ALPHA2_CODES);

/** Accepts case-insensitive input and returns uppercase code. */
export const CountryCodeInputSchema = z
  .string()
  .min(2)
  .max(2)
  .transform((value: string) => value.toUpperCase())
  .pipe(CountryCodeSchema);

const COUNTRY_NAME_VALUES = Object.values(COUNTRY_NAME_BY_CODE) as [CountryName, ...CountryName[]];

/** Strict English country name (as defined by ISO mapping). */
export const CountryNameSchema = z.enum(COUNTRY_NAME_VALUES);
