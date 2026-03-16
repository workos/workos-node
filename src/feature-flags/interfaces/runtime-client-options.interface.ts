import { FlagPollEntry } from './flag-poll-response.interface';

export interface RuntimeClientLogger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export interface RuntimeClientOptions {
  pollingIntervalMs?: number;
  bootstrapFlags?: Record<string, FlagPollEntry>;
  requestTimeoutMs?: number;
  logger?: RuntimeClientLogger;
}
