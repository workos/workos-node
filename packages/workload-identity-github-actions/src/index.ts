// @oagen-ignore-file
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * An identity token provider for GitHub Actions. Each call asks the runner's
 * OIDC endpoint for a token with the given audience.
 *
 * The job needs `permissions: id-token: write`.
 *
 * @param audience - The audience the token is requested for. It must match
 * the audience of the trust rule, conventionally `https://api.workos.com`.
 *
 * @example
 * new WorkloadIdentityCredentials({
 *   identityTokenProvider: githubActions('https://api.workos.com'),
 * });
 */
export function githubActions(audience: string): () => Promise<string> {
  if (!audience) {
    throw new TypeError('githubActions: an audience is required.');
  }

  return async () => {
    // Read on every call. Both are set only for a job that may request a token.
    const requestUrl = readEnv('ACTIONS_ID_TOKEN_REQUEST_URL');
    const requestToken = readEnv('ACTIONS_ID_TOKEN_REQUEST_TOKEN');

    if (!requestUrl || !requestToken) {
      throw new Error(
        'GitHub Actions did not provide an OIDC token endpoint. Add `permissions: id-token: write` to the workflow or job.',
      );
    }

    // The URL already has a query string; add to it.
    const separator = requestUrl.includes('?') ? '&' : '?';
    const response = await fetch(
      `${requestUrl}${separator}audience=${encodeURIComponent(audience)}`,
      {
        headers: {
          Authorization: `Bearer ${requestToken}`,
          Accept: 'application/json',
        },
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );

    if (response.status !== 200) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error(
        `The GitHub Actions OIDC token request failed with status ${response.status}.`,
      );
    }

    // The body holds the token, so a body that cannot be read is never quoted.
    const body: unknown = await response.json().catch(() => undefined);
    const token = (body as { value?: unknown } | undefined)?.value;

    if (typeof token !== 'string' || !token) {
      throw new Error(
        'The GitHub Actions OIDC token response did not include a token.',
      );
    }

    return token;
  };
}

function readEnv(name: string): string | undefined {
  return typeof process === 'undefined' ? undefined : process.env?.[name];
}
