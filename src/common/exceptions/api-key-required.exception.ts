export class ApiKeyRequiredException extends Error {
  readonly status = 403;
  readonly name = 'ApiKeyRequiredException';
  readonly path: string;

  /**
   * @param path - The API path that needs an API key.
   * @param message - Replaces the default message, for a caller that can say
   * more exactly why the API key is needed.
   */
  constructor(path: string, message?: string) {
    super(
      message ??
        `API key required for "${path}". ` +
          `For server-side apps, initialize with: new WorkOS("sk_..."). ` +
          `For browser/mobile/CLI apps, use authenticateWithCodeAndVerifier() and authenticateWithRefreshToken() which work without an API key.`,
    );
    this.path = path;
  }
}
