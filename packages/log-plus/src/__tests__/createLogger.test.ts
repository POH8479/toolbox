import { createLogger } from "../core/createLogger";
import { jsonFormatter } from "../formatters/json";
import { LogLevel, type LogRecord, type Transport } from "../types";

describe("createLogger", () => {
  it("emits records that meet the minimum level", () => {
    const captured: Array<{ record: LogRecord; formatted: unknown }> = [];
    const transport: Transport = ({ record, formatted }) => {
      captured.push({ record, formatted });
    };

    const logger = createLogger({
      level: LogLevel.INFO,
      transports: [transport],
      formatter: jsonFormatter(),
      clock: () => new Date("2025-09-25T20:41:12Z"),
      context: { service: "api" },
    });

    logger.info({ text: "structured" }, { requestId: "abc" });

    expect(captured).toHaveLength(1);
    const [entry] = captured;
    expect(entry.record.message).toBe('{"text":"structured"}');
    expect(entry.record.data).toEqual({ requestId: "abc" });
    expect(entry.record.timestamp).toBe("2025-09-25 20:41:12");
    expect(entry.record.context).toEqual({ service: "api" });
    expect(entry.formatted).toEqual({ json: entry.record });
  });

  it("suppresses records below the configured level", () => {
    const transport = jest.fn();
    const logger = createLogger({
      level: LogLevel.ERROR,
      transports: [transport],
      formatter: jsonFormatter(),
      clock: () => new Date("2025-09-25T20:41:12Z"),
    });

    logger.trace("lowest");
    logger.debug("lower");
    logger.info("mid");
    logger.warn("ignore");
    logger.error("capture");
    logger.fatal("fatal");

    expect(transport).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = transport.mock.calls as Array<[{ record: LogRecord }]>;
    expect(firstCall[0].record.level).toBe(LogLevel.ERROR);
    expect(secondCall[0].record.level).toBe(LogLevel.FATAL);
  });

  it("records errors distinctly from metadata objects", () => {
    const transport = jest.fn();
    const logger = createLogger({
      level: LogLevel.INFO,
      transports: [transport],
      formatter: jsonFormatter(),
      clock: () => new Date("2025-09-25T20:41:12Z"),
    });

    const error = new Error("boom");
    logger.error("failed", error);

    expect(transport).toHaveBeenCalledTimes(1);
    const [payload] = transport.mock.calls[0];
    const record = payload.record as LogRecord;
    expect(record.message).toBe("failed");
    expect(record.error).toEqual({ name: "Error", message: "boom", stack: error.stack });
    expect(record.data).toBeUndefined();
  });

  it("merges context for child loggers and honours withLevel overrides", () => {
    const entries: LogRecord[] = [];
    const transport: Transport = ({ record }) => entries.push(record);

    const logger = createLogger({
      level: LogLevel.WARN,
      transports: [transport],
      formatter: jsonFormatter(),
      clock: () => new Date("2025-09-25T20:41:12Z"),
      context: { base: true },
    });

    const child = logger.child({ requestId: "abc" });
    child.error("child error");

    expect(entries).toHaveLength(1);
    expect(entries[0].context).toEqual({ base: true, requestId: "abc" });

    const debugLogger = logger.withLevel(LogLevel.DEBUG);
    debugLogger.debug("allowed");
    expect(entries).toHaveLength(2);
    expect(entries[1].level).toBe(LogLevel.DEBUG);
    expect(entries[1].context).toEqual({ base: true });
  });

  it("falls back to the console transport when none are provided", () => {
    const originalConsole = globalThis.console;
    const logSpy = jest.fn();

    const mockedConsole = {
      log: logSpy,
      info: logSpy,
      warn: logSpy,
      error: logSpy,
      debug: logSpy,
      trace: logSpy,
    } satisfies Pick<Console, "log" | "info" | "warn" | "error" | "debug" | "trace">;
    globalThis.console = mockedConsole as Console;

    try {
      const logger = createLogger();
      logger.info("hello");

      const loggerWithEmptyTransports = createLogger({
        clock: () => new Date("2025-09-25T20:41:12Z"),
        transports: [],
      });
      loggerWithEmptyTransports.info("hello again");

      expect(logSpy).toHaveBeenCalledTimes(2);
    } finally {
      globalThis.console = originalConsole;
    }
  });
});
