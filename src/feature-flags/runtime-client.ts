import { EventEmitter } from 'events';
import { WorkOS } from '../workos';
import { UnauthorizedException } from '../common/exceptions';
import { InMemoryStore } from './in-memory-store';
import { Evaluator } from './evaluator';
import {
  EvaluationContext,
  FlagPollResponse,
  RuntimeClientOptions,
  RuntimeClientLogger,
  RuntimeClientStats,
} from './interfaces';

const DEFAULT_POLLING_INTERVAL_MS = 30_000;
const MIN_POLLING_INTERVAL_MS = 5_000;
const MIN_DELAY_MS = 1_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const JITTER_FACTOR = 0.1;
const INITIAL_RETRY_MS = 1_000;
const MAX_RETRY_MS = 60_000;
const BACKOFF_MULTIPLIER = 2;

export class FeatureFlagsRuntimeClient extends EventEmitter {
  private readonly store: InMemoryStore;
  private readonly evaluator: Evaluator;
  private readonly pollingIntervalMs: number;
  private readonly requestTimeoutMs: number;
  private readonly logger?: RuntimeClientLogger;

  private closed = false;
  private initialized = false;
  private consecutiveErrors = 0;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;

  private readyResolve: (() => void) | null = null;
  private readyPromise: Promise<void>;

  private stats: RuntimeClientStats = {
    pollCount: 0,
    pollErrorCount: 0,
    lastPollAt: null,
    lastSuccessfulPollAt: null,
    cacheAge: null,
    flagCount: 0,
  };

  constructor(
    private readonly workos: WorkOS,
    options: RuntimeClientOptions = {},
  ) {
    super();

    this.pollingIntervalMs = Math.max(
      MIN_POLLING_INTERVAL_MS,
      options.pollingIntervalMs ?? DEFAULT_POLLING_INTERVAL_MS,
    );
    this.requestTimeoutMs =
      options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    this.logger = options.logger;

    this.store = new InMemoryStore();
    this.evaluator = new Evaluator(this.store);

    this.readyPromise = new Promise<void>((resolve) => {
      this.readyResolve = resolve;
    });
    // Prevent unhandled rejection if no one awaits waitUntilReady
    this.readyPromise.catch(() => {});

    if (options.bootstrapFlags) {
      this.store.swap(options.bootstrapFlags);
      this.stats.flagCount = this.store.size;
      this.resolveReady();
    }

    this.poll();
  }

  async waitUntilReady(options?: { timeoutMs?: number }): Promise<void> {
    if (!options?.timeoutMs) {
      return this.readyPromise;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<void>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error('waitUntilReady timed out')),
        options.timeoutMs,
      );
    });
    // Prevent unhandled rejection when race settles via readyPromise
    timeoutPromise.catch(() => {});

    return Promise.race([this.readyPromise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  }

  close(): void {
    this.closed = true;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.removeAllListeners();
  }

  isEnabled(
    flagKey: string,
    context?: EvaluationContext,
    defaultValue?: boolean,
  ): boolean {
    return this.evaluator.isEnabled(flagKey, context, defaultValue);
  }

  getAllFlags(context?: EvaluationContext): Record<string, boolean> {
    return this.evaluator.getAllFlags(context);
  }

  getFlag(flagKey: string) {
    return this.store.get(flagKey);
  }

  getStats(): RuntimeClientStats {
    return {
      ...this.stats,
      cacheAge: this.stats.lastSuccessfulPollAt
        ? Date.now() - this.stats.lastSuccessfulPollAt.getTime()
        : null,
    };
  }

  private resolveReady(): void {
    if (this.readyResolve) {
      this.readyResolve();
      this.readyResolve = null;
    }
  }

  private async poll(): Promise<void> {
    if (this.closed) {
      return;
    }

    const previousFlags = this.store.getAll();

    try {
      this.stats.pollCount++;
      this.stats.lastPollAt = new Date();

      const data = await this.fetchWithTimeout();

      this.store.swap(data);
      this.stats.lastSuccessfulPollAt = new Date();
      this.stats.flagCount = this.store.size;
      this.consecutiveErrors = 0;

      if (this.initialized) {
        this.emitChanges(previousFlags, data);
      }
      this.initialized = true;
      this.resolveReady();

      this.logger?.debug('Poll successful', { flagCount: this.store.size });
    } catch (error) {
      this.consecutiveErrors++;
      this.stats.pollErrorCount++;
      this.emit('error', error);
      this.logger?.error('Poll failed', error);

      if (error instanceof UnauthorizedException) {
        this.emit('failed', error);
        return;
      }
    }

    this.scheduleNextPoll();
  }

  private async fetchWithTimeout(): Promise<FlagPollResponse> {
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchPromise = this.workos
      .get<FlagPollResponse>('/sdk/feature-flags')
      .then(({ data }) => data);

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error('Request timed out')),
        this.requestTimeoutMs,
      );
    });

    return Promise.race([fetchPromise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  }

  private scheduleNextPoll(): void {
    if (this.closed) {
      return;
    }

    let baseDelay = this.pollingIntervalMs;

    if (this.consecutiveErrors > 0) {
      const backoff = Math.min(
        INITIAL_RETRY_MS *
          Math.pow(BACKOFF_MULTIPLIER, this.consecutiveErrors - 1),
        MAX_RETRY_MS,
      );
      baseDelay = Math.max(baseDelay, backoff);
    }

    const jitter = 1 + (Math.random() * 2 - 1) * JITTER_FACTOR;
    const delay = Math.max(MIN_DELAY_MS, baseDelay * jitter);

    this.pollTimer = setTimeout(() => this.poll(), delay);
  }

  private emitChanges(
    previous: FlagPollResponse,
    current: FlagPollResponse,
  ): void {
    if (!previous || !current) {
      return;
    }

    const allKeys = new Set([
      ...Object.keys(previous),
      ...Object.keys(current),
    ]);

    for (const key of allKeys) {
      const prev = previous[key];
      const curr = current[key];

      if (JSON.stringify(prev) !== JSON.stringify(curr)) {
        this.emit('change', { key, previous: prev ?? null, current: curr ?? null });
      }
    }
  }
}
