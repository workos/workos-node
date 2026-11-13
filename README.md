# WorkOS Node.js Library

![npm](https://img.shields.io/npm/v/@workos-inc/node)
[![Build Status](https://github.com/workos/workos-node/actions/workflows/ci.yml/badge.svg)](https://github.com/workos/workos-node/actions/workflows/ci.yml)

The WorkOS library for Node.js provides convenient access to the WorkOS API from applications written in server-side JavaScript.

## Documentation

See the [API Reference](https://workos.com/docs/reference/client-libraries) for Node.js usage examples.

## Requirements

Node 22.11 or higher.

## Installation

Install the package with:

```
npm install @workos-inc/node
```

## Configuration

To use the library you must provide an API key, located in the WorkOS dashboard, as an environment variable `WORKOS_API_KEY`:

```sh
WORKOS_API_KEY="sk_1234"
```

Or, you can set it on your own before your application starts:

```ts
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS('sk_1234');
```

### Automatic retries

The SDK automatically retries requests that fail with a transient error — a
network error, a request timeout (408), a rate limit (429), or a server error
(500, 502, 503, 504) — using exponential backoff with jitter. When the API
responds with a `Retry-After` header, the SDK waits for that duration instead
(capped at 60 seconds). Retried `POST` requests are automatically assigned an
`Idempotency-Key` header (unless one is already set) so a retried write is not
applied twice.

The default is 3 retries. Configure it client-wide, or per request on the
low-level HTTP methods:

```ts
// Client-wide: up to 5 retries per request
const workos = new WorkOS('sk_1234', { maxRetries: 5 });

// Per-request override: disable retries for this call only
await workos.get('/organizations', { maxRetries: 0 });
```

Set `maxRetries: 0` to disable automatic retries entirely.

The request timeout (`timeout`, 60 seconds by default) covers each attempt from
the request being sent to the response body being fully read, so a server that
returns headers promptly but stalls the body still times out. A timeout while
reading a successful response body is reported as a 408 but is not
automatically retried, because the server has already applied the request.

### Access token issuer validation

Session helpers (`authenticateWithSessionCookie`, `loadSealedSession(...).authenticate()`)
verify the access token signature against the WorkOS JWKS. To also enforce the
token's `iss` claim, pass the expected issuer when creating the client:

```ts
const workos = new WorkOS('sk_1234', {
  clientId: 'client_...',
  issuer: 'https://api.workos.com/user_management/client_...',
});
```

`issuer` also accepts an array when tokens from more than one issuer should be
accepted. When `issuer` is not set, the `iss` claim is not validated.

### Verifying access tokens

To verify an access token your application received elsewhere, for example from
an `Authorization: Bearer` header, use `verifyAccessToken`. It checks the
signature against the WorkOS JWKS and the expiry, plus the issuer when one is
configured, and that the token is a user access token rather than one WorkOS
signed for another purpose, such as an agent or widget token. It returns the
token's claims, or `null` when the token is invalid:

```ts
const claims = await workos.userManagement.verifyAccessToken(accessToken);

if (!claims) {
  throw new Error('Invalid access token');
}

console.log(claims.sub, claims.org_id, claims.permissions);
```

## Workload identity

A workload running in GitHub Actions, Google Cloud or AWS can call the WorkOS API without an API key. It exchanges the identity token its platform issues for a short-lived WorkOS access token. The SDK makes the exchange, caches the token and replaces it shortly before it expires.

Install the SDK and the provider package for your platform:

```
npm install @workos-inc/node @workos-inc/workload-identity-github-actions
```

Then pass `credentials` in place of an API key:

```ts
import { WorkOS, WorkloadIdentityCredentials } from '@workos-inc/node';
import { githubActions } from '@workos-inc/workload-identity-github-actions';

const workos = new WorkOS({
  credentials: new WorkloadIdentityCredentials({
    clientId: 'client_...', // the M2M application that has the trust rule
    tokenUrl: 'https://<your token endpoint>/oauth2/token',
    environmentId: 'environment_...', // optional
    identityTokenProvider: githubActions('https://api.workos.com'),
  }),
});

const organizations = await workos.organizations.listOrganizations();
```

`clientId`, `tokenUrl`, `environmentId` and `scope` default to the `WORKOS_CLIENT_ID`, `WORKOS_WIF_TOKEN_URL`, `WORKOS_ENVIRONMENT_ID` and `WORKOS_WIF_SCOPE` environment variables. Those variables only fill in fields you leave out: workload identity is used only when you pass `credentials`. A client built with `credentials` ignores `WORKOS_API_KEY`, and passing both `credentials` and an API key is an error.

`environmentId` is optional. WorkOS binds a workload identity client to exactly one environment, so the value selects nothing. Setting it is a safety check: the SDK sends it as the `x-url-environment-id` header on every API request, and a value that names a different environment gets `403 environment_mismatch`. When it is not set, the header is not sent.

### Platform providers

Each platform has its own package. The argument is the audience the identity token is requested for, which must match the audience of the trust rule.

GitHub Actions. The job needs `permissions: id-token: write`:

```ts
import { githubActions } from '@workos-inc/workload-identity-github-actions';

const identityTokenProvider = githubActions('https://api.workos.com');
```

Google Cloud (Compute Engine, GKE, Cloud Run, Cloud Functions, App Engine):

```ts
import { gcpMetadata } from '@workos-inc/workload-identity-gcp';

const identityTokenProvider = gcpMetadata('https://api.workos.com');
```

AWS. The region is optional when the AWS SDK can resolve one:

```ts
import { awsSts } from '@workos-inc/workload-identity-aws';

const identityTokenProvider = awsSts('https://api.workos.com', 'us-east-1');
```

### Custom providers

A provider is any function that returns the identity token. Use a callback for a platform without a package:

```ts
const credentials = new WorkloadIdentityCredentials({
  identityTokenProvider: async () => {
    const response = await fetch('https://identity.internal.example/token');
    return response.text();
  },
});
```

`tokenFile` reads the token from a file and `tokenEnv` from an environment variable, on every exchange, so a rotated token is picked up:

```ts
import { tokenEnv, tokenFile } from '@workos-inc/node';

tokenFile('/var/run/secrets/tokens/workos');
tokenEnv('MY_PLATFORM_JWT');
```

WorkOS accepts an identity token for one exchange. The SDK makes a new exchange about every four minutes. If the file or variable still holds the same token then, that exchange fails with `invalid_grant`. So use `tokenFile` and `tokenEnv` for a source that something rewrites before each exchange, or for a job shorter than five minutes. The platform providers (GitHub Actions, Google Cloud, AWS) fetch a new token every time.

`tokenFile` needs a file system, so it is not exported from `@workos-inc/node/worker`.

### Errors

A failed exchange throws a `WorkloadIdentityError`. Its `code` is the OAuth error code from the token endpoint (for example `invalid_grant`) or an SDK code (`exchange_failed`, `invalid_response`, `provider_failed`, `invalid_configuration`), `description` is the server's explanation, and `hint` says what to check. The exchange is retried on network failures, 429 and 5xx responses. An API request that gets a 401 is retried once with a new token.

## Public Client Mode (Browser/Mobile/CLI)

For apps that can't securely store secrets, initialize with just a client ID:

```ts
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS({ clientId: 'client_...' }); // No API key needed

// Generate auth URL with automatic PKCE
const { url, codeVerifier } =
  await workos.userManagement.getAuthorizationUrlWithPKCE({
    provider: 'authkit',
    redirectUri: 'myapp://callback',
    clientId: 'client_...',
  });

// After user authenticates, exchange code for tokens
const { accessToken, refreshToken } =
  await workos.userManagement.authenticateWithCode({
    code: authorizationCode,
    codeVerifier,
    clientId: 'client_...',
  });
```

> [!IMPORTANT]
> Store `codeVerifier` securely on-device between generating the auth URL and handling the callback. For mobile apps, use platform secure storage (iOS Keychain, Android Keystore). For CLI apps, consider OS credential storage. The verifier must survive app restarts during the auth flow.

See the [AuthKit documentation](https://workos.com/docs/authkit) for details on PKCE authentication.

### PKCE with Confidential Clients

Server-side apps can also use PKCE alongside the client secret for defense in depth (recommended by OAuth 2.1):

```ts
const workos = new WorkOS('sk_...'); // With API key

// Use PKCE even with API key for additional security
const { url, codeVerifier } =
  await workos.userManagement.getAuthorizationUrlWithPKCE({
    provider: 'authkit',
    redirectUri: 'https://example.com/callback',
    clientId: 'client_...',
  });

// Both client_secret AND code_verifier will be sent
const { accessToken } = await workos.userManagement.authenticateWithCode({
  code: authorizationCode,
  codeVerifier,
  clientId: 'client_...',
});
```

## Feature flag runtime

The runtime client polls the v2 flag payload and evaluates flags locally. When a
flag is off it serves `off_value`. Otherwise rules are evaluated in array order:
the first matching rule's `value` wins, and `default_value` applies when no rule
matches. A matching rule can serve `false`. Every condition in a rule must match;
`one_of` matches an exact ID for its target type. Unknown rule kinds and condition
operators never match.

`isEnabled(key, context, defaultValue)` returns `defaultValue` (`false` when
omitted) if the flag is missing or the served value is not a boolean.
`getAllFlags` uses `false` in that case.

`getFlag(key)` returns the flag's `FlagPollEntry`: `slug`, `enabled`,
`default_value`, `off_value` and `rules`. The `previous` and `current` values in
`change` events have the same shape. Reordering rules emits a `change` event;
reordering IDs within a condition does not.

To start from saved configuration, pass a `FlagPollResponse`
(`{ version: 2, flags: { [slug]: FlagPollEntry } }`) as `bootstrapFlags`.
Unrecognized bootstrap data, including a bare map of entries without the
envelope, is ignored with a warning to `logger` and readiness still resolves;
polling populates the cache afterward.

A failed poll, including one that returns a payload the SDK can't read, emits
`error`, keeps the last good snapshot, and retries with backoff. A 401 stops
polling and also emits `failed`. Attach an `error` listener or a `logger` to see
failures; with neither, the client warns once and keeps polling, and warns again
if a 401 stops it.

## SDK Versioning

For our SDKs WorkOS follows a Semantic Versioning ([SemVer](https://semver.org/)) process where all releases will have a version X.Y.Z (like 1.0.0) pattern wherein Z would be a bug fix (e.g., 1.0.1), Y would be a minor release (1.1.0) and X would be a major release (2.0.0). We permit any breaking changes to only be released in major versions and strongly recommend reading changelogs before making any major version upgrades.

## Beta Releases

WorkOS has features in Beta that can be accessed via Beta releases. We would love for you to try these
and share feedback with us before these features reach general availability (GA). To install a Beta version,
please follow the [installation steps](#installation) above using the Beta release version.

> Note: there can be breaking changes between Beta versions. Therefore, we recommend pinning the package version to a
> specific version. This way you can install the same version each time without breaking changes unless you are
> intentionally looking for the latest Beta version.

We highly recommend keeping an eye on when the Beta feature you are interested in goes from Beta to stable so that you
can move to using the stable version.

## More Information

- [Single Sign-On Guide](https://workos.com/docs/sso/guide)
- [Directory Sync Guide](https://workos.com/docs/directory-sync/guide)
- [Admin Portal Guide](https://workos.com/docs/admin-portal/guide)
- [Magic Link Guide](https://workos.com/docs/magic-link/guide)
- [Domain Verification Guide](https://workos.com/docs/domain-verification/guide)
