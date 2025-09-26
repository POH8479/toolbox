import { LogLevel } from "./types";

const nativeConsole: Console = console;

export type SplitMetadataResult = {
  data?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
};

export const defaultClock = () => new Date();

export function levelName(logLevel: LogLevel): keyof typeof LogLevel {
  const entry = Object.entries(LogLevel).find(([, candidateValue]) => {
    return typeof candidateValue === "number" && candidateValue === logLevel;
  });
  return (entry?.[0] as keyof typeof LogLevel) ?? "INFO";
}

export function coerceMessage(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function splitMetadata(metadata?: Record<string, unknown> | Error): SplitMetadataResult {
  if (!metadata) return {};
  if (metadata instanceof Error) {
    return {
      error: { name: metadata.name, message: metadata.message, stack: metadata.stack },
    };
  }
  return { data: metadata };
}

export function styleFor(level: LogLevel): string {
  switch (level) {
    case LogLevel.TRACE:
      return "color:gray";
    case LogLevel.DEBUG:
      return "color:#888";
    case LogLevel.INFO:
      return "color:#1e88e5";
    case LogLevel.WARN:
      return "color:#f9a825";
    case LogLevel.ERROR:
      return "color:#e53935";
    case LogLevel.FATAL:
      return "background:#e53935;color:#fff;padding:0 4px;border-radius:2px";
    default:
      return "";
  }
}

export function formatLevelTag(levelNameKey: keyof typeof LogLevel): string {
  const bracketedLevel = `[${levelNameKey}]`;
  return bracketedLevel.padEnd(8, " ");
}

export function pickConsole(level: LogLevel) {
  const consoleObject = (globalThis as { console?: Console }).console ?? nativeConsole;
  if (level >= LogLevel.ERROR)
    return consoleObject.error?.bind(consoleObject) ?? consoleObject.log.bind(consoleObject);
  if (level >= LogLevel.WARN)
    return consoleObject.warn?.bind(consoleObject) ?? consoleObject.log.bind(consoleObject);
  if (level >= LogLevel.INFO)
    return consoleObject.info?.bind(consoleObject) ?? consoleObject.log.bind(consoleObject);
  if (level >= LogLevel.DEBUG)
    return consoleObject.debug?.bind(consoleObject) ?? consoleObject.log.bind(consoleObject);
  return consoleObject.trace?.bind(consoleObject) ?? consoleObject.log.bind(consoleObject);
}
