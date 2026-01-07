# WorkOS Node.js Library

![npm](https://img.shields.io/npm/v/@workos-inc/node)
[![Build Status](https://github.com/workos/workos-node/actions/workflows/ci.yml/badge.svg)](https://github.com/workos/workos-node/actions/workflows/ci.yml)

The WorkOS library for Node.js provides convenient access to the WorkOS API from applications written in server-side JavaScript.

## Documentation

See the [API Reference](https://workos.com/docs/reference/client-libraries) for Node.js usage examples.

## Requirements

Node 20 or higher.

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
