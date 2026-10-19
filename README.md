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
polling and also emits `failed`.

## Feature flag rule management

Create an empty rule, then add memberships using the rule's ID:

```ts
const rule = await workos.featureFlags.createFlagRule({
  flagSlug: 'new-checkout',
  targetType: 'organization',
  value: true,
});

const membership = await workos.featureFlags.createFlagTarget({
  ruleId: rule.id,
  targetId: 'org_...',
});

await workos.featureFlags.deleteFlagTarget(membership.id);
```

The `flagSlug` option is sent as `flag_slug` to the API for rule creation and
listing. Membership creation sends only `rule_id` and `target_id`; the rule
supplies the flag, target type, and served value.

Use `getFlagTarget(membership.id)` to read a target or combine filters when listing:

```ts
const members = await workos.featureFlags.listFlagTargets({
  ruleId: rule.id,
  flagSlug: 'new-checkout',
  targetType: 'organization',
  order: 'asc',
});
const allMembers = await members.autoPagination();
```

Target lists also accept `targetId`, `limit`, `before`, and `after`. The SDK
defaults target lists to descending creation order, so `after` advances through
the results. Rule lists always follow evaluation order.

Rules are appended in evaluation order. `targetType` can be `organization`,
`user`, or a registered custom target type. A duplicate rule with the same
target type and value returns a conflict; it does not reuse the existing rule.
Use `listFlagRules({ flagSlug: 'new-checkout' })` to find existing rules,
`getFlagRule(rule.id)` to inspect one, or `deleteFlagRule(rule.id)` to delete a
rule and its memberships. Rule lists support `limit`, `before`, `after`, and
`autoPagination()` and always follow the server's evaluation order.

To create a rule and its initial members together:

```ts
import { CreateRuleWithTargetsError } from '@workos-inc/node';

try {
  const { rule, targets } = await workos.featureFlags.createRuleWithTargets({
    flagSlug: 'new-checkout',
    targetType: 'organization',
    value: true,
    targetIds: ['org_first', 'org_second'],
  });
} catch (error) {
  if (error instanceof CreateRuleWithTargetsError) {
    // Save these IDs to reconcile or resume membership creation.
    console.error(
      error.rule.id,
      error.targets,
      error.failedTargetId,
      error.cause,
    );
  }
  throw error;
}
```

This helper performs separate requests in order and stops at the first failure.
It does not roll back: the rule and confirmed memberships remain. A rule
creation error is returned unchanged; a membership error includes the created
rule, confirmed memberships, failed target ID, and original error as `cause`.
After an ambiguous network failure, the failed membership may also exist on
the server. Reconcile it before retrying; do not retry the whole helper, which
would try to create the rule again. An empty `targetIds` list creates an empty
rule.

The legacy `addFlagTarget({ slug, targetId })` and
`removeFlagTarget({ slug, targetId })` helpers remain supported on their alias
routes. Their deprecation annotations guide new integrations toward explicit
rules; existing integrations do not need to change.

`getFlagTarget()` and `listFlagTargets()` return `FlagTargetResource`: a
`FlagTarget` with `ruleId`, or a `LegacyFlagTarget` with `value` and
`valueType` while the environment still uses the legacy target contract. Narrow
using `'ruleId' in target` before accessing the contract-specific fields.

## Feature flag events

The Events API and `webhooks.constructEvent` support the namespaced feature flag
lifecycle events:

- `feature_flags.flag.created`, `feature_flags.flag.updated`, `feature_flags.flag.deleted`
- `feature_flags.flag_rule.created`, `feature_flags.flag_rule.updated`, `feature_flags.flag_rule.deleted`
- `feature_flags.flag_target.created`, `feature_flags.flag_target.deleted`

Use these names in `events.listEvents({ events: [...] })`. The returned `Event`
union narrows by `event`; event data and context use camelCase fields.

```ts
const { data: events } = await workos.events.listEvents({
  events: [
    'feature_flags.flag_target.created',
    'feature_flags.flag_rule.updated',
  ],
});

for (const event of events) {
  if (event.event === 'feature_flags.flag_target.created') {
    if ('ruleId' in event.data) {
      console.log(event.data.ruleId, event.data.targetId);
    } else {
      console.log(event.data.valueType, event.data.value);
    }
  }
}
```

Flag events include `environmentId`, nullable `description`, and a nullable
`owner` with `email`, `firstName`, and `lastName`. Updated flag context includes
optional `previousAttributes.data`. Rule context can omit `actor` for system
changes. Target event data is a `FlagTarget` with `ruleId`, or a
`LegacyFlagTarget` with `value` and `valueType`. The `flag.*` events keep their
existing data shape.

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
