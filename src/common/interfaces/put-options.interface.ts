export interface PutOptions {
  query?: { [key: string]: any };
  idempotencyKey?: string;
  /** Skip API key requirement check (for PKCE-safe methods) */
  skipApiKeyCheck?: boolean;
}
