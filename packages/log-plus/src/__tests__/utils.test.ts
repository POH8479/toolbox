import { LogLevel } from "../types";
import {
  defaultClock,
  levelName,
  coerceMessage,
  splitMetadata,
  styleFor,
  formatLevelTag,
  pickConsole,
} from "../utils";

describe("utils", () => {
  const originalConsole = globalThis.console;

  afterEach(() => {
    globalThis.console = originalConsole;
    jest.restoreAllMocks();
  });

  it("returns a Date from defaultClock", () => {
    const now = defaultClock();
    expect(now).toBeInstanceOf(Date);
  });

  it("derives the level name or falls back to INFO", () => {
    expect(levelName(LogLevel.ERROR)).toBe("ERROR");
    expect(levelName(999 as LogLevel)).toBe("INFO");
  });

  it("coerces arbitrary messages", () => {
    expect(coerceMessage("hello" as const)).toBe("hello");
    expect(coerceMessage({ a: 1 })).toBe('{"a":1}');

    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(coerceMessage(circular)).toBe(String(circular));
  });

  it("splits metadata into error or data payloads", () => {
    expect(splitMetadata()).toEqual({});

    const metadataObject = { userId: "abc" };
    expect(splitMetadata(metadataObject)).toEqual({ data: metadataObject });

    const testError = new Error("boom");
    expect(splitMetadata(testError)).toEqual({
      error: { name: "Error", message: "boom", stack: testError.stack },
    });
  });

  it("selects the right style for each level", () => {
    expect(styleFor(LogLevel.TRACE)).toBe("color:gray");
    expect(styleFor(LogLevel.DEBUG)).toBe("color:#888");
    expect(styleFor(LogLevel.INFO)).toBe("color:#1e88e5");
    expect(styleFor(LogLevel.WARN)).toBe("color:#f9a825");
    expect(styleFor(LogLevel.ERROR)).toBe("color:#e53935");
    expect(styleFor(LogLevel.FATAL)).toBe(
      "background:#e53935;color:#fff;padding:0 4px;border-radius:2px",
    );
    expect(styleFor(LogLevel.SILENT)).toBe("");
  });

  it("formats the level tag with brackets and padding", () => {
    expect(formatLevelTag("INFO")).toBe("[INFO]  ");
    expect(formatLevelTag("TRACE")).toBe("[TRACE] ");
  });

  it("picks console writers for each level and falls back to log when missing", () => {
    const mockConsole = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    } satisfies Pick<Console, "log" | "error" | "warn" | "info" | "debug" | "trace">;
    globalThis.console = mockConsole as Console;

    pickConsole(LogLevel.ERROR)("error");
    expect(mockConsole.error).toHaveBeenCalledWith("error");

    pickConsole(LogLevel.WARN)("warn");
    expect(mockConsole.warn).toHaveBeenCalledWith("warn");

    pickConsole(LogLevel.INFO)("info");
    expect(mockConsole.info).toHaveBeenCalledWith("info");

    pickConsole(LogLevel.DEBUG)("debug");
    expect(mockConsole.debug).toHaveBeenCalledWith("debug");

    pickConsole(LogLevel.TRACE)("trace");
    expect(mockConsole.trace).toHaveBeenCalledWith("trace");
  });

  it("uses console.log as a fallback when a specific method is missing", () => {
    const mockConsole = {
      log: jest.fn(),
      error: undefined,
      warn: undefined,
      info: undefined,
      debug: undefined,
      trace: undefined,
    } satisfies Partial<Console> & Pick<Console, "log">;
    globalThis.console = mockConsole as Console;

    pickConsole(LogLevel.ERROR)("error");
    pickConsole(LogLevel.WARN)("warn");
    pickConsole(LogLevel.INFO)("info");
    pickConsole(LogLevel.DEBUG)("debug");
    pickConsole(LogLevel.TRACE)("trace");

    expect(mockConsole.log).toHaveBeenCalledTimes(5);
    expect(mockConsole.log).toHaveBeenNthCalledWith(1, "error");
    expect(mockConsole.log).toHaveBeenNthCalledWith(2, "warn");
    expect(mockConsole.log).toHaveBeenNthCalledWith(3, "info");
    expect(mockConsole.log).toHaveBeenNthCalledWith(4, "debug");
    expect(mockConsole.log).toHaveBeenNthCalledWith(5, "trace");
  });

  it("falls back to the stored console when the global console is missing", () => {
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => undefined);
    const originalConsoleReference = globalThis.console;
    // @ts-expect-error intentionally unset for test coverage
    globalThis.console = undefined;

    pickConsole(LogLevel.INFO)("fallback");

    expect(infoSpy).toHaveBeenCalledWith("fallback");
    infoSpy.mockRestore();
    globalThis.console = originalConsoleReference;
  });
});
