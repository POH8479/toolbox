import type { Formatter } from "../types";
import { styleFor, formatLevelTag } from "../utils";

/**
 * Pretty formatter with colours in Node + Browser + RN consoles.
 * Falls back gracefully where styling is unsupported.
 */
export function prettyFormatter(): Formatter {
  return (record) => {
    const paddedLevelTag = formatLevelTag(record.levelName);
    const outputParts: string[] = [
      `%c${record.timestamp}%c`,
      `%c${paddedLevelTag}%c`,
      `%c${record.message}%c`,
    ];
    const styleDirectives = [
      "font-weight:600",
      "",
      styleFor(record.level),
      "",
      "font-weight:500",
      "",
    ];

    const formatterArguments: unknown[] = [...styleDirectives];
    if (record.data) {
      outputParts.push("%o");
      formatterArguments.push(record.data);
    }
    if (record.error) {
      outputParts.push("\n%o");
      formatterArguments.push(record.error);
    }

    return { text: outputParts.join(" "), argumentList: formatterArguments };
  };
}
