// @oagen-ignore-file
const REQUEST_TIMEOUT_MS = 10_000;

const IDENTITY_URL =
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity';

/**
 * An identity token provider for Google Cloud. Each call asks the metadata
 * server for an identity token of the default service account, with the
 * given audience.
 *
 * Works wherever the metadata server is reachable: Compute Engine, GKE,
 * Cloud Run, Cloud Functions and App Engine.
 *
 * @param audience - The audience the token is requested for. It must match
 * the audience of the trust rule, conventionally `https://api.workos.com`.
 *
 * @example
 * new WorkloadIdentityCredentials({
 *   identityTokenProvider: gcpMetadata('https://api.workos.com'),
 * });
 */
export function gcpMetadata(audience: string): () => Promise<string> {
  if (!audience) {
    throw new TypeError('gcpMetadata: an audience is required.');
  }

  return async () => {
    const response = await fetch(
      `${IDENTITY_URL}?audience=${encodeURIComponent(audience)}&format=full`,
      {
        headers: { 'Metadata-Flavor': 'Google' },
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );

    if (response.status !== 200) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error(
        `The GCP metadata server responded with status ${response.status}.`,
      );
    }

    const token = (await response.text()).trim();

    if (!token) {
      throw new Error('The GCP metadata server returned an empty token.');
    }

    return token;
  };
}
