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
  timeout?: number; // Timeout in milliseconds
  /**
   * Maximum number of automatic retries for transient failures (network
   * errors and 408/429/5xx responses). Retries use exponential backoff with
   * jitter and honor the `Retry-After` header. Defaults to 3. Set to `0` to
   * disable automatic retries.
   */
  maxRetries?: number;
}
