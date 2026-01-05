export class ApiKeyRequiredException extends Error {
  readonly status = 403;
  readonly name = 'ApiKeyRequiredException';
  readonly path: string;

  constructor(path: string) {
    super(
      `API key required for "${path}". ` +
        `Initialize WorkOS with an API key (new WorkOS("sk_...")), ` +
        `or use PKCE-compatible methods for public clients.`,
    );
    this.path = path;
  }
}
