import { FlagPollResponseV2 } from './flag-poll-response.interface';

export interface RuntimeClientLogger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export interface RuntimeClientOptions {
  pollingIntervalMs?: number;
  /** A versioned envelope, as returned by polling. */
  bootstrapFlags?: FlagPollResponseV2;
  requestTimeoutMs?: number;
  logger?: RuntimeClientLogger;
}
