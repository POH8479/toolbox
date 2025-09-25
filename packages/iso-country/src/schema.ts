import { z } from "zod";
import { ISO_ALPHA2_CODES } from "./constants";

/** Strict ISO 3166-1 alpha-2 code (uppercase). */
export const CountryCodeSchema = z.enum(ISO_ALPHA2_CODES);

/** Accepts case-insensitive input and returns uppercase code. */
export const CountryCodeInputSchema = z
  .string()
  .min(2)
  .max(2)
  .transform((value: string) => value.toUpperCase())
  .pipe(CountryCodeSchema);
