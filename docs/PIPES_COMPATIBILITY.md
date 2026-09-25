# Pipes compatibility notes

## Public types and release review

The credential-schema refactoring preserves the API's JSON contract, but the
expanded SDK types are not a blanket source-compatible replacement for older
versions:

- `DataIntegration.credentials` can be `null` for API-key and client-credentials
  integrations. Check for credentials before accessing `clientId` or
  `redactedClientSecret`; do not substitute invented OAuth credentials.
- Credential responses distinguish active and inactive results. Typed response
  fixtures must include `active` and the matching `credential` or `error`.
- API-key credentials have no OAuth expiry or scope fields. Code that assumes
  every credential has a scope array needs to check `authMethod`, or use optional
  access such as `result.credential?.scopes?.includes('repo')`.
- Authentication-method and connected-account-state unions have additional
  values. Exhaustive consumer switches may need additional cases.
- Credential types that were interfaces are now union types. Custom types should
  use an intersection rather than an interface extending the union.

Existing reads such as `result.error` and `result.credential?.value` remain
supported without first narrowing on `active`. `CreateDataIntegrationOptions`
remains an interface that consumers can augment.

The previous `DataIntegrationCredentialsResponseCredential` and
`DataIntegrationCredentialsResponseCredentialResponse` names remain exported as
aliases of `DataIntegrationVendedCredential` and its wire type. The existing
credential deserializer name also remains available. These are not removed or
renamed imports, even though the underlying response types are more precise.

The new organization-integration methods are
`getOrganizationDataIntegration`, `updateOrganizationDataIntegration`, and
`deleteOrganizationDataIntegration`. No previously released method was renamed.

Maintainers must resolve the remaining type-compatibility changes before deciding
on a release version. With this repository's default release-please versioning,
`!` or a `BREAKING CHANGE` footer in the commit that lands on `main` requests a
major release. Removing that metadata alone does not make these changes
compatible. Release-please owns the version and changelog updates.

## Ownership values

Provider-list responses retain the legacy `ownership` field:

| Legacy provider `ownership` | Preferred `connectionOwner` |
| --------------------------- | --------------------------- |
| `userland_user`             | `user`                      |
| `organization`              | `organization`              |

Existing consumers do not need to rewrite the legacy response value. New code
should prefer `connectionOwner`, falling back to the mapping above when reading
an older response that omits it.

Integration creation and listing use `ownership: 'user' | 'organization'`.
Connection authorization, credential vending, and credential rotation instead
use `connectionOwner`, which defaults to `user`. Organization-owned requests need
an `organizationId`; the supplied `userId` identifies the acting member rather
than making that member the owner.

## Multiple connections are opt-in

Omitting `supportsMultipleConnections`, or passing `false`, keeps the
compatibility-connection behavior. Opt in with `true` to work with multiple
connections:

1. Use `listUserDataProviders` or `listOrganizationDataProviders` with
   `supportsMultipleConnections: true` to obtain `connectedAccounts`.
2. Select a connection by its `id`, not its display name or account identifier.
3. Pass that ID as `connectedAccountId` on reads, updates, deletes, or credential
   vending. Continue sending the plural opt-in where the operation supports it.

The legacy `connectedAccount` field still represents only the compatibility
connection and may be `null` even when standard connections exist. With plural
opt-in, credential vending without an account selector can return HTTP 409
`account_selection_required` when several connections match.

## Explicit connection creation and reauthorization

Use `createDataIntegrationApiKey` or
`createDataIntegrationClientCredential` to POST an API-key or client-credentials
connection. Both require `connectionIntent: 'add'` and take no account selector.
POST requests use the SDK's existing idempotency-key handling for retries once
the API honors `Idempotency-Key` on these routes.

The existing `updateDataIntegrationApiKey` and
`updateDataIntegrationClientCredentials` methods still use PUT. They keep
compatibility upsert behavior when intent and selector are omitted. To update
an exact connection, supply `connectedAccountId`; an explicit
`connectionIntent: 'reauthorize'` is optional, but requires that selector.
Do not send `add` intent to PUT.

OAuth imports (`createUserConnectedAccount` and
`createOrganizationConnectedAccount`) accept `connectionIntent: 'add'` in the
body. Omitting it keeps compatibility behavior. Their update counterparts accept
`connectionIntent: 'reauthorize'` and the account selector in the query.
`supportsMultipleConnections` remains accepted on updates, but it does not select
the update target.

Creating additional connections is still subject to API availability. The
current contract allows `add` for the owner's first connection and otherwise
returns HTTP 404 `multiple_connections_unavailable` until additional creation is
enabled. The SDK propagates that error; it does not fall back to rotating an
existing connection.

## Provider configuration

`createDataIntegrationCredential` preserves `credential.config` for OAuth,
API-key, and client-credentials results. It contains provider-declared,
non-secret integration- and installation-scope snapshot values plus current
defaults. It is separate from client-credentials token `metadata`.

Connected-account detail and provider-list results also preserve `config` for
all authentication methods. Those maps contain stored, non-secret
installation-scope values, rather than the combined/defaulted credential config.
Secret and undeclared values are filtered by the API, not guessed or filtered by
the SDK. An empty map stays empty; missing config from older API responses stays
`undefined`. The legacy `getAccessToken` response is unchanged.

## Generation boundaries

`ConnectedAccountDto` and `DataIntegrationCredentialsDto` remain published
compatibility interfaces. Their legacy serializers delegate to the generated
`ConnectedAccountInput` and `DataIntegrationCredentialsInput` serializers. The
four legacy TypeScript files are explicitly protected with `@oagen-ignore-file`.
Their two JSON fixtures remain inputs to compatibility tests.

Those legacy DTO files and fixtures intentionally stay outside
`.oagen-manifest.json`: the manifest records generated-file ownership, not every
SDK file. Adding obsolete generated paths would make them candidates for pruning
when the current spec no longer emits them. Preserve compatibility files rather
than deleting them to make the directory match the manifest.

The credential response types retain hand-maintained compatibility fields and
metadata typing. The `DataIntegrationCredentialsResponseCredential` alias files
(interface, serializer, and fixture) re-export the generated
`DataIntegrationVendedCredential` component under its published name and, like
the legacy DTOs, stay outside the manifest. The two direct-query DELETE methods are protected with
`@oagen-ignore` regions until the Node emitter's helper-signature fix is available.

API-key and client-credentials PUT options also retain their published flat
interfaces and explicit snake_case serializers. The current emitter passes the
new union request bodies through unchanged, which would send camelCase keys from
the SDK. These interfaces, serializers, and method regions are protected until
that emission path is fixed. They remain in the manifest where the spec still
emits the corresponding paths.
