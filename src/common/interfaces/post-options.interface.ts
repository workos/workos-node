export interface PostOptions {
  query?: { [key: string]: any };
  idempotencyKey?: string;
  warrantToken?: string;
  /** Skip API key requirement check (for PKCE-safe methods) */
  skipApiKeyCheck?: boolean;
}
