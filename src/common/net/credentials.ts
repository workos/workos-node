// @oagen-ignore-file

/**
 * What a caller passes to {@link Credentials.resolve}.
 */
export interface CredentialContext {
  /**
   * Stops this caller from waiting. It never cancels work that other callers
   * share, such as a token exchange already in progress.
   */
  signal?: AbortSignal;
}

/**
 * The authorization headers for one HTTP attempt, and the credential they
 * came from.
 */
export interface CredentialSnapshot {
  /** Headers to set on the attempt. They replace any header of the same name. */
  readonly headers: Readonly<Record<string, string>>;
  /** Opaque. Identifies the credential these headers came from. */
  readonly generation: number;
  /** Whether a 401 on this snapshot is worth one more `resolve`. */
  readonly recoverable: boolean;
}

/**
 * How a client authorizes its API requests. The client resolves a snapshot
 * before every HTTP attempt and, on a 401, invalidates the generation that
 * attempt used.
 */
export interface Credentials {
  resolve(context?: CredentialContext): Promise<CredentialSnapshot>;
  /** Never waits on the network. */
  invalidate(generation: number): void;
}

/**
 * A static API key: the same header on every attempt, and nothing to recover
 * when the API rejects it.
 */
export class StaticKeyCredentials implements Credentials {
  private readonly snapshot: CredentialSnapshot;

  constructor(key: string) {
    this.snapshot = {
      headers: { Authorization: `Bearer ${key}` },
      generation: 0,
      recoverable: false,
    };
  }

  resolve(): Promise<CredentialSnapshot> {
    return Promise.resolve(this.snapshot);
  }

  invalidate(): void {
    // A static key has no newer credential to fetch.
  }
}
