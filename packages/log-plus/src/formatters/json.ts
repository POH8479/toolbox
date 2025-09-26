import type { Formatter } from "../types";

export function jsonFormatter(): Formatter {
  return (record) => ({ json: record });
}
