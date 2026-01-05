export class ApiKeyRequiredException extends Error {
  readonly status = 403;
  readonly name = 'ApiKeyRequiredException';
  readonly path: string;

  constructor(path: string) {
    super(
      `API key required for "${path}". ` +
        `For server-side apps, initialize with: new WorkOS("sk_..."). ` +
        `For browser/mobile/CLI apps, use authenticateWithCodeAndVerifier() and authenticateWithRefreshToken() which work without an API key.`,
    );
    this.path = path;
  }
}
