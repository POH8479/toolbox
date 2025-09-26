import {
  LogLevel,
  type FormatterResult,
  type Logger,
  type LoggerOptions,
  type LogRecord,
  type Transport,
} from "../types";
import { defaultClock, levelName, coerceMessage, splitMetadata } from "../utils";
import { jsonFormatter } from "../formatters/json";
import { consoleTransport } from "../transports/console";

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? LogLevel.INFO;
  const formatter = options.formatter ?? jsonFormatter();
  const transportList: Transport[] =
    options.transports && options.transports.length > 0 ? options.transports : [consoleTransport()];
  const clockFunction = options.clock ?? defaultClock;
  const boundContext = options.context ?? {};

  const emitRecord = (
    logLevel: LogLevel,
    message: unknown,
    maybeMetadata?: Record<string, unknown> | Error,
  ) => {
    if (logLevel < level) return;

    const currentDate = clockFunction();
    const iso8601Timestamp = currentDate.toISOString();
    const timestamp = iso8601Timestamp.slice(0, 19).replace("T", " ");
    const metadataParts = splitMetadata(maybeMetadata);
    const context = Object.keys(boundContext).length ? boundContext : undefined;
    const record: LogRecord = {
      level: logLevel,
      levelName: levelName(logLevel),
      timestamp,
      message: coerceMessage(message),
      data: metadataParts.data,
      error: metadataParts.error,
      context,
    };

    const formatted: FormatterResult = formatter(record);
    for (const transport of transportList) {
      transport({ record, formatted });
    }
  };

  const logger: Logger = {
    level,
    trace: (message, metadata) => emitRecord(LogLevel.TRACE, message, metadata),
    debug: (message, metadata) => emitRecord(LogLevel.DEBUG, message, metadata),
    info: (message, metadata) => emitRecord(LogLevel.INFO, message, metadata),
    warn: (message, metadata) => emitRecord(LogLevel.WARN, message, metadata),
    error: (message, metadata) => emitRecord(LogLevel.ERROR, message, metadata),
    fatal: (message, metadata) => emitRecord(LogLevel.FATAL, message, metadata),
    child(additionalContext) {
      return createLogger({
        level,
        formatter,
        transports: transportList,
        clock: clockFunction,
        context: { ...boundContext, ...additionalContext },
      });
    },
    withLevel(newLevel) {
      return createLogger({ ...options, level: newLevel, context: boundContext });
    },
  };

  return logger;
}
