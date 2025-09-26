import type { Transport } from "../types";
import { pickConsole, formatLevelTag } from "../utils";

export function consoleTransport(): Transport {
  return ({ record, formatted }) => {
    const text = formatted.text ?? "";
    const formattedArguments = formatted.argumentList ?? [];
    const logFunction = pickConsole(record.level);
    const levelTag = formatLevelTag(record.levelName);
    try {
      logFunction(text, ...formattedArguments);
    } catch {
      logFunction(`${record.timestamp} ${levelTag}${record.message}`, record.data, record.error);
    }
  };
}
