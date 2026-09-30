import { FlagPollResponse } from './flag-poll-response.interface';

export interface RuntimeClientLogger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export interface RuntimeClientOptions {
  pollingIntervalMs?: number;
  /** A legacy flat payload or a versioned v2 envelope, as returned by polling. */
  bootstrapFlags?: FlagPollResponse;
  requestTimeoutMs?: number;
  logger?: RuntimeClientLogger;
}
