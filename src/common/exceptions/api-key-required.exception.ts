export class ApiKeyRequiredException extends Error {
  readonly status = 403;
  readonly name = 'ApiKeyRequiredException';
  readonly methodName: string;

  constructor(methodName: string) {
    super(
      `The method "${methodName}" requires an API key. ` +
        `Initialize WorkOS with your API key (new WorkOS("sk_...")), ` +
        `or use PKCE methods like authenticateWithCodeAndVerifier() for public clients.`,
    );
    this.methodName = methodName;
  }
}
