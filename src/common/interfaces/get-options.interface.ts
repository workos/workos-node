export interface GetOptions {
  query?: Record<string, any>;
  accessToken?: string;
  warrantToken?: string;
  /** Skip API key requirement check (for PKCE-safe methods) */
  skipApiKeyCheck?: boolean;
}
