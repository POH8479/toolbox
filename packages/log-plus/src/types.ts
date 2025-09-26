export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
  SILENT = 99,
}

export type LogMethod = (message: unknown, metadata?: Record<string, unknown> | Error) => void;

export type LogRecord = {
  level: LogLevel;
  levelName: keyof typeof LogLevel;
  timestamp: string; // UTC date-time (YYYY-MM-DD HH:mm:ss)
  message: string;
  data?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
  context?: Record<string, unknown>;
};

export type FormatterResult = {
  text?: string;
  argumentList?: unknown[];
  json?: unknown;
};
export type Formatter = (record: LogRecord) => FormatterResult;
export type Transport = (payload: { record: LogRecord; formatted: FormatterResult }) => void;

export type LoggerOptions = {
  level?: LogLevel;
  formatter?: Formatter;
  transports?: Transport[];
  clock?: () => Date;
  context?: Record<string, unknown>;
};

export type Logger = {
  level: LogLevel;
  trace: LogMethod;
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  fatal: LogMethod;
  child(bindings: Record<string, unknown>): Logger;
  withLevel(level: LogLevel): Logger;
};
