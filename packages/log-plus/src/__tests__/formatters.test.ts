import { jsonFormatter } from "../formatters/json";
import { prettyFormatter } from "../formatters/pretty";
import { LogLevel, type LogRecord } from "../types";

describe("formatters", () => {
  it("returns structured JSON from jsonFormatter", () => {
    const record: LogRecord = {
      level: LogLevel.INFO,
      levelName: "INFO",
      timestamp: "2025-01-01 00:00:00",
      message: "hello",
    };

    const formatted = jsonFormatter()(record);
    expect(formatted).toEqual({ json: record });
  });

  it("formats a friendly string with styles using prettyFormatter", () => {
    const record: LogRecord = {
      level: LogLevel.INFO,
      levelName: "INFO",
      timestamp: "2025-01-01 00:00:00",
      message: "hello world",
    };

    const formatted = prettyFormatter()(record);
    expect(formatted.text).toBe("%c2025-01-01 00:00:00%c %c[INFO]  %c %chello world%c");
    expect(formatted.argumentList).toEqual([
      "font-weight:600",
      "",
      "color:#1e88e5",
      "",
      "font-weight:500",
      "",
    ]);
  });

  it("includes metadata and errors when provided", () => {
    const error = new Error("fail");
    const record: LogRecord = {
      level: LogLevel.ERROR,
      levelName: "ERROR",
      timestamp: "2025-01-01 00:00:00",
      message: "boom",
      data: { id: 1 },
      error: { name: error.name, message: error.message, stack: error.stack },
    };

    const formatted = prettyFormatter()(record);
    expect(formatted.text).toBe("%c2025-01-01 00:00:00%c %c[ERROR] %c %cboom%c %o \n%o");
    expect(formatted.argumentList).toEqual([
      "font-weight:600",
      "",
      "color:#e53935",
      "",
      "font-weight:500",
      "",
      record.data,
      record.error,
    ]);
  });
});
