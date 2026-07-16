export interface GetOptions {
  query?: Record<string, any>;
  accessToken?: string;
  warrantToken?: string;
  /** Skip API key requirement check (for PKCE-safe methods) */
  skipApiKeyCheck?: boolean;
  /** Maximum number of retries for this request, overriding the client-wide `maxRetries`. */
  maxRetries?: number;
}
