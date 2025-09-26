import { consoleTransport } from "../transports/console";
import { httpTransport } from "../transports/http";
import { LogLevel, type LogRecord } from "../types";

describe("transports", () => {
  const originalConsole = globalThis.console;
  const originalFetch = (globalThis as { fetch?: typeof fetch }).fetch;

  afterEach(() => {
    globalThis.console = originalConsole;
    (globalThis as { fetch?: typeof fetch }).fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("writes formatted output via the chosen console method", () => {
    const infoMock = jest.fn();
    const mockedConsole = {
      log: jest.fn(),
      info: infoMock,
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    } satisfies Pick<Console, "log" | "info" | "warn" | "error" | "debug" | "trace">;
    globalThis.console = mockedConsole as Console;

    const transport = consoleTransport();
    const record: LogRecord = {
      level: LogLevel.INFO,
      levelName: "INFO",
      timestamp: "2025-09-25 20:41:12",
      message: "hello",
    };

    transport({ record, formatted: { text: "formatted", argumentList: [1, 2] } });

    expect(infoMock).toHaveBeenCalledWith("formatted", 1, 2);
  });

  it("falls back to a plain string when the console method throws", () => {
    const logMock = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("fail");
      })
      .mockImplementationOnce(() => undefined);

    const mockedConsole = {
      log: logMock,
    } satisfies Pick<Console, "log">;
    globalThis.console = mockedConsole as Console;

    const transport = consoleTransport();
    const record: LogRecord = {
      level: LogLevel.INFO,
      levelName: "INFO",
      timestamp: "2025-09-25 20:41:12",
      message: "hello",
    };

    transport({ record, formatted: { text: "formatted" } });

    expect(logMock).toHaveBeenNthCalledWith(
      2,
      "2025-09-25 20:41:12 [INFO]  hello",
      undefined,
      undefined,
    );
  });

  it("backs off when fetch is unavailable", () => {
    (globalThis as { fetch?: typeof fetch }).fetch = undefined;

    const transport = httpTransport("https://example.com");
    const record: LogRecord = {
      level: LogLevel.DEBUG,
      levelName: "DEBUG",
      timestamp: "2025-09-25 20:41:12",
      message: "ping",
    };

    expect(() => transport({ record, formatted: {} })).not.toThrow();
  });

  it("posts formatted JSON when fetch is provided", async () => {
    const fetchMock = jest.fn().mockResolvedValue(undefined);
    const transport = httpTransport("https://example.com", fetchMock);
    const record: LogRecord = {
      level: LogLevel.ERROR,
      levelName: "ERROR",
      timestamp: "2025-09-25 20:41:12",
      message: "boom",
    };

    const formattedPayload = { json: { custom: true } };
    transport({ record, formatted: formattedPayload });

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith("https://example.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(formattedPayload.json),
    });
  });

  it("posts raw records when the formatter does not supply JSON", async () => {
    const fetchMock = jest.fn().mockResolvedValue(undefined);
    const transport = httpTransport("https://example.com", fetchMock);
    const record: LogRecord = {
      level: LogLevel.TRACE,
      levelName: "TRACE",
      timestamp: "2025-09-25 20:41:12",
      message: "trace",
    };

    transport({ record, formatted: {} });

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith("https://example.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(record),
    });
  });

  it("swallows fetch errors to avoid crashing the caller", async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error("network"));
    const transport = httpTransport("https://example.com", fetchMock);
    const record: LogRecord = {
      level: LogLevel.INFO,
      levelName: "INFO",
      timestamp: "2025-09-25 20:41:12",
      message: "ignored",
    };

    await expect(async () => {
      transport({ record, formatted: {} });
      await Promise.resolve();
    }).not.toThrow();

    expect(fetchMock).toHaveBeenCalled();
  });
});
