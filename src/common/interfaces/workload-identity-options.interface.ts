/**
 * Authenticate with a workload identity instead of an API key.
 *
 * The SDK exchanges the platform's ID token (for example a GitHub Actions
 * OIDC token) for a short-lived WorkOS API access token, keeps it in memory
 * and renews it before it expires.
 */
export interface WorkloadIdentityOptions {
  /** Client ID of the WorkOS API machine client that trusts this workload. */
  clientId: string;
  /**
   * Returns the platform's ID token. Called once per exchange and must return
   * a fresh token each time, because an ID token is accepted only once.
   */
  tokenSource: () => Promise<string>;
  /** Full URL of the OAuth token endpoint, e.g. `https://<domain>/oauth2/token`. */
  tokenEndpoint: string;
  /** Environment the requests act on, sent as `x-url-environment-id`. */
  environmentId?: string;
  /**
   * Scopes to request, as a space-separated string or a list. Defaults to
   * every scope the machine client holds.
   */
  scope?: string | string[];
}
