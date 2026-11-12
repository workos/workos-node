// @oagen-ignore-file
import http from 'node:http';

const REQUEST_TIMEOUT_MS = 10_000;
const METADATA_HOST = 'metadata.google.internal';
const IDENTITY_PATH =
  '/computeMetadata/v1/instance/service-accounts/default/identity';

/**
 * The metadata server is an address inside the workload's own VM or
 * container. A proxy is another machine: it cannot reach that server, and it
 * could answer with its own identity. So the request never goes through one.
 *
 * Started with `NODE_USE_ENV_PROXY=1`, Node sends `fetch` requests, and
 * `node:http` requests that use the default agent, through the proxy named
 * by `HTTP_PROXY`. `fetch` has no per-request way out of that, so the
 * request is made with `node:http` and this agent of its own, which the
 * setting does not reach.
 */
const agent = new http.Agent();

/**
 * An identity token provider for Google Cloud. Each call asks the metadata
 * server for an identity token of the default service account, with the
 * given audience.
 *
 * Works wherever the metadata server is reachable: Compute Engine, GKE,
 * Cloud Run, Cloud Functions and App Engine. The request never goes through
 * a proxy.
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

  const path = `${IDENTITY_PATH}?audience=${encodeURIComponent(audience)}&format=full`;

  return () =>
    new Promise<string>((resolve, reject) => {
      // `node:http` follows no redirect: a 3xx comes back as the response.
      const request = http.request(
        {
          host: METADATA_HOST,
          path,
          method: 'GET',
          headers: { 'Metadata-Flavor': 'Google' },
          agent,
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
        (response) => {
          response.on('error', reject);

          if (response.statusCode !== 200) {
            // The body is dropped unread: an error never needs it.
            response.destroy();
            reject(
              new Error(
                `The GCP metadata server responded with status ${response.statusCode}.`,
              ),
            );
            return;
          }

          const chunks: Buffer[] = [];
          response.on('data', (chunk: Buffer) => chunks.push(chunk));
          response.on('end', () => {
            const token = Buffer.concat(chunks).toString('utf8').trim();
            if (token) {
              resolve(token);
            } else {
              reject(
                new Error('The GCP metadata server returned an empty token.'),
              );
            }
          });
        },
      );

      request.on('error', reject);
      request.end();
    });
}
