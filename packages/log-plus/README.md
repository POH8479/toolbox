# @poh8479/log-plus

A cross‑platform logging library for **Node.js**, **Web**, and **Native**. It brings Java‑style log levels and UTC timestamps to JavaScript with a consistent API, pluggable **formatters** and **transports**, and zero required runtime dependencies.

> Goals: predictable levels, stable formatting, structured payloads, fast level checks, portable across runtimes.

## Features

- Java‑style levels: `TRACE, DEBUG, INFO, WARN, ERROR, FATAL` (+ `SILENT` to disable)
- UTC date-time stamps (customisable clock)
- Identical API across Node, Browser, and React Native
- Pluggable **formatters** (pretty / JSON) and **transports** (console / HTTP)
- Structured logging: message + metadata object and/or `Error`
- Child loggers with bound context (e.g. `requestId`)
- Tree‑shakeable ESM, CJS builds
- TypeScript first, no runtime deps

## Install

```bash
pnpm add @poh8479/log-plu
```

## Quick start

```ts
import { createLogger, LogLevel, consoleTransport, prettyFormatter } from "log-plus";

const log = createLogger({
  level: LogLevel.INFO,
  formatter: prettyFormatter(),
  transports: [consoleTransport()],
  context: { service: "api" },
});

log.info("Server started", { port: 3000 });
const reqLog = log.child({ requestId: "abc-123" });
reqLog.debug("Parsed headers", { accept: "application/json" });
reqLog.error("Boom!", new Error("Oops"));
```

**Output (pretty formatter):**

```
2025-09-25 20:41:12 [INFO]  Server started { port: 3000 }
2025-09-25 20:41:12 [ERROR] Boom! { name: "Error", message: "Oops", stack: "…" }
```

## Runtime support

- **Node.js**: uses `globalThis.console` and works with ESM/CJS.
- **Web**: prints to DevTools. Use the HTTP transport to ship JSON logs.
- **React Native**: maps to native logs; Dev Menu shows console output.

## API

### `createLogger(options: LoggerOptions): Logger`

Creates a logger with the given options.

**LoggerOptions**

- `level?: LogLevel` — minimum level to emit (default `INFO`)
- `formatter?: Formatter` — how to format records (default `jsonFormatter()`)
- `transports?: Transport[]` — where to send records (default `[consoleTransport()]`)
- `clock?: () => Date` — override timestamp source (useful for tests)
- `context?: Record<string, unknown>` — bound fields added to each record

**Logger methods**

- `trace|debug|info|warn|error|fatal(message, metadata?)`
- `child(bindings)` — returns a new logger inheriting options + merged context
- `withLevel(level)` — returns a new logger with a different minimum level

### Levels

```ts
enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
  SILENT = 99,
}
```

## Formatters

### `prettyFormatter()`

Human‑readable text for consoles (Node/Web/RN), with subtle colouring where supported.

### `jsonFormatter()`

Returns structured JSON suitable for ingestion by log collectors.

```ts
import { jsonFormatter } from "log-plus";
const log = createLogger({ formatter: jsonFormatter() });
```

## Transports

### `consoleTransport()`

Writes to `console.*` using the most appropriate method for the level.

### `httpTransport(targetUrl: string, fetchImplementation?: typeof fetch)`

Fire‑and‑forget POST of each record (formatted JSON if the formatter returns `json`, otherwise the raw record) to `targetUrl`.

```ts
import { httpTransport, jsonFormatter } from "log-plus";

const log = createLogger({
  level: LogLevel.DEBUG,
  formatter: jsonFormatter(),
  transports: [httpTransport("/logs"), consoleTransport()],
});
```

> Tip: consider batching + backoff on mobile; see Roadmap.

## Structured logging

Pass either a metadata object or an `Error` as the second argument. If you pass an Error, it is serialised as `{ name, message, stack }`.

```ts
log.info("User logged in", { userId: "u_42", plan: "pro" });
log.error("Payment failed", new Error("card_declined"));
```

## Child loggers

Bind context to all subsequent records without repeating yourself.

```ts
const base = createLogger({ context: { service: "web" } });
const requestLog = base.child({ requestId: "abc-123" });
requestLog.info("Handling route", { path: "/home" });
```

## Environment‑based level

A small helper pattern if you want environment driven levels without adding dependencies:

```ts
const envLevel = (process.env.LOG_LEVEL as keyof typeof LogLevel) ?? "INFO";
const log = createLogger({ level: LogLevel[envLevel] ?? LogLevel.INFO });
```

In browsers/React Native, you can attach `globalThis.__LOG_LEVEL__ = "DEBUG"` during bootstrap.

## FAQ

**Does it support log redaction?**
Yes, implement a custom formatter/transport that masks fields before emitting.

**How do I add source location (file:line)?**
Implement a formatter that parses a synthetic stack: `new Error().stack` (guard on RN).

## Roadmap

- HTTP batching with jittered backoff (browser/RN friendly)
- Node‑only file transport with rotation
- Pluggable redactors and samplers
- RFC‑3339/locale timestamp options

## Non‑Essential Enhancements

- `log.printf("Hello %s", name)` convenience
- `log.time("op").done()` scoped timers that emit duration
- Breadcrumb buffer (last N records included with `error`)

## Licence

MIT
