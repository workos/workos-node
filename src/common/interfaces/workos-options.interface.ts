import { AppInfo } from './app-info.interface';

export interface WorkOSOptions {
  apiKey?: string;
  apiHostname?: string;
  https?: boolean;
  port?: number;
  config?: RequestInit;
  appInfo?: AppInfo;
  fetchFn?: typeof fetch;
  clientId?: string;
  /**
   * Expected `iss` claim of WorkOS access tokens, enforced when verifying
   * session access tokens. Accepts a single issuer or a list of allowed
   * issuers. When not set, the issuer claim is not validated.
   */
  issuer?: string | string[];
  timeout?: number; // Timeout in milliseconds
  /**
   * Maximum number of automatic retries for transient failures (network
   * errors and 408/429/5xx responses). Retries use exponential backoff with
   * jitter and honor the `Retry-After` header (capped at 60 seconds).
   * Defaults to 3. Set to `0` to disable automatic retries.
   */
  maxRetries?: number;
}
