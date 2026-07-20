export interface PatchOptions {
  query?: { [key: string]: any };
  idempotencyKey?: string;
  /** Skip API key requirement check (for PKCE-safe methods) */
  skipApiKeyCheck?: boolean;
  /** Maximum number of retries for this request, overriding the client-wide `maxRetries`. */
  maxRetries?: number;
}
