# WorkOS Node SDK v9 Migration Guide

This guide will help you migrate from v8 to v9 of the WorkOS Node SDK.

## Table of Contents

- [Quick Start](#quick-start)
- [Node.js Version Requirement](#nodejs-version-requirement)
- [What Changed in v9](#what-changed-in-v9)
- [Breaking Changes by Module](#breaking-changes-by-module)

---

## Quick Start

1. Update Node.js to `22.11.0` or newer
2. Update the package: `npm install @workos-inc/node@9`
3. Remove any usage of the legacy `fga` client
4. Rename moved or renamed methods (called out below)

If your app already uses `workos.authorization` instead of `workos.fga`, and you are not depending on legacy authorization pagination behavior, **most of the upgrade is straightforward search-and-replace**.

---

## Node.js Version Requirement

**Minimum Node.js version is now `22.11.0+`.**

v9 drops support for Node.js 20. The SDK `engines` field now requires `>=22.11.0`.

```bash
node --version
```

If you are deploying on an older runtime, upgrade that first. Otherwise `npm install` may fail or your runtime may be unsupported.

---

## What Changed in v9

v9 combines three kinds of changes:

- Runtime/platform changes:
  - Node 20 support was dropped
- SDK surface cleanup:
  - legacy `fga` was removed
  - several resources and methods were renamed to match the generated OpenAPI spec
  - some methods moved to more appropriate resource clients
- Model and behavior alignment:
  - authorization list endpoints now use consistent pagination defaults
  - newer v9 releases also tighten error typing and webhook event handling

---

## Breaking Changes by Module

### Authorization

#### Authorization list endpoints now use standardized pagination

In v8, some authorization list endpoints did not use the shared pagination behavior. In practice, that meant they defaulted differently from the rest of the SDK.

In v9, authorization list endpoints now follow the same pagination flow as other paginated resources:

- default order is now descending
- cursor behavior now matches the shared SDK paginator
- if your code relied on the old default cursor direction, pagination may return different `before`/`after` values than before

If you depend on a specific traversal order, pass `order` explicitly instead of relying on the default.

**Before (v8):**

```typescript
const page = await workos.authorization.listRoleAssignments({
  organizationMembershipId: 'om_123',
});

// Some authorization list endpoints behaved differently from the rest
// of the SDK when no explicit order was provided.
```

**After (v9):**

```typescript
const page =
  await workos.authorization.listOrganizationMembershipRoleAssignments({
    organizationMembershipId: 'om_123',
    order: 'desc',
  });
```

#### Authorization method renames

Several authorization methods were renamed to match the generated SDK naming.

Some authorization methods use positional arguments for required identifiers, while others continue to take a single options object. Re-check the updated signatures when migrating.

| Before                                                 | After                                                      |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| `authorization.setOrganizationRolePermissions`         | `authorization.updateRolePermissions`                      |
| `authorization.addOrganizationRolePermission`          | `authorization.createRolePermission`                       |
| `authorization.removeOrganizationRolePermission`       | `authorization.deleteRolePermission`                       |
| `authorization.getResourceByExternalId`                | `authorization.getOrganizationResource`                    |
| `authorization.updateResourceByExternalId`             | `authorization.updateOrganizationResource`                 |
| `authorization.deleteResourceByExternalId`             | `authorization.deleteOrganizationResource`                 |
| `authorization.listRoleAssignments`                    | `authorization.listOrganizationMembershipRoleAssignments`  |
| `authorization.removeRoleAssignment`                   | `authorization.deleteOrganizationMembershipRoleAssignment` |
| `authorization.listResourcesForMembership`             | `authorization.listOrganizationMembershipResources`        |
| `authorization.listMembershipsForResourceByExternalId` | `authorization.listResourceOrganizationMemberships`        |
| `authorization.listEffectivePermissions`               | `authorization.listResourcePermissions`                    |

Two authorization list methods were also added as part of the pagination standardization work:

- `authorization.listResourcePermissions(...)`
- `authorization.listEffectivePermissionsByExternalId(...)`

If you previously paginated these endpoints manually, re-check the returned cursor behavior in your tests.

### Legacy FGA Removal

The deprecated legacy Fine-Grained Authorization client was removed in v9.

#### What was removed

- `workos.fga`
- imports from the legacy `src/fga` surface
- all legacy `/fga/v1/*` client wrappers

#### What to use instead

Use `workos.authorization`.

Common high-level migrations look like this:

- `workos.fga.check(...)` -> `workos.authorization.check(...)`
- `workos.fga.listResources(...)` -> `workos.authorization.listResources(...)`
- `workos.fga.getResource(...)` -> `workos.authorization.getResource(...)`

If you are still on the deprecated FGA client in v8, migrate that usage before or during your v9 upgrade. There is no compatibility shim in v9, and some FGA concepts map to the newer Authorization APIs differently rather than as a direct argument-for-argument rename.

### Multi-Factor Auth and Admin Portal Renames

Two resource clients were renamed for consistency.

#### Class renames

| Before   | After             |
| -------- | ----------------- |
| `Mfa`    | `MultiFactorAuth` |
| `Portal` | `AdminPortal`     |

#### WorkOS client accessor renames

| Before          | After                    |
| --------------- | ------------------------ |
| `workos.mfa`    | `workos.multiFactorAuth` |
| `workos.portal` | `workos.adminPortal`     |

#### Import path renames

| Before                        | After                                    |
| ----------------------------- | ---------------------------------------- |
| `@workos-inc/node/mfa/...`    | `@workos-inc/node/multi-factor-auth/...` |
| `@workos-inc/node/portal/...` | `@workos-inc/node/admin-portal/...`      |

**Before (v8):**

```typescript
await workos.mfa.enrollFactor({
  type: 'totp',
  issuer: 'My App',
  user: 'user_123',
});

await workos.portal.generateLink({
  organization: 'org_123',
  intent: 'sso',
});
```

**After (v9):**

```typescript
await workos.multiFactorAuth.enrollFactor({
  type: 'totp',
  issuer: 'My App',
  user: 'user_123',
});

await workos.adminPortal.generateLink({
  organization: 'org_123',
  intent: 'sso',
});
```

The functionality is the same — this is primarily a rename of the accessor.

### Organization Domains

`OrganizationDomains` methods were renamed to be more explicit.

| Before                                | After                                                   |
| ------------------------------------- | ------------------------------------------------------- |
| `organizationDomains.get(id)`         | `organizationDomains.getOrganizationDomain(id)`         |
| `organizationDomains.verify(id)`      | `organizationDomains.verifyOrganizationDomain(id)`      |
| `organizationDomains.create(payload)` | `organizationDomains.createOrganizationDomain(payload)` |
| `organizationDomains.delete(id)`      | `organizationDomains.deleteOrganizationDomain(id)`      |

**Before (v8):**

```typescript
const domain = await workos.organizationDomains.get('org_domain_123');
await workos.organizationDomains.verify('org_domain_123');
```

**After (v9):**

```typescript
const domain =
  await workos.organizationDomains.getOrganizationDomain('org_domain_123');
await workos.organizationDomains.verifyOrganizationDomain('org_domain_123');
```

### API Keys

#### `validateApiKey` method rename

The API keys validation method was renamed.

| Before                            | After                               |
| --------------------------------- | ----------------------------------- |
| `apiKeys.validateApiKey(payload)` | `apiKeys.createValidation(payload)` |

**Before (v8):**

```typescript
const result = await workos.apiKeys.validateApiKey({
  value: 'sk_test_123',
});
```

**After (v9):**

```typescript
const result = await workos.apiKeys.createValidation({
  value: 'sk_test_123',
});
```

### Widgets

#### `getToken` renamed to `createToken`

The widgets token method was renamed and its return type changed.

| Before (v8)                                  | After (v9)                                                 |
| -------------------------------------------- | ---------------------------------------------------------- |
| `widgets.getToken(options)` returns `string` | `widgets.createToken(options)` returns `{ token: string }` |

**Before (v8):**

```typescript
const token = await workos.widgets.getToken({
  organizationId: 'org_123',
  userId: 'user_123',
  scopes: ['widgets:users-table:manage'],
});
// token is a string
```

**After (v9):**

```typescript
const { token } = await workos.widgets.createToken({
  organizationId: 'org_123',
  userId: 'user_123',
  scopes: ['widgets:users-table:manage'],
});
// Destructure `token` from the response object
```

### Methods Moved to Different Resources

Some methods still exist in v9, but they now live on a different resource client. The resource clients they moved to (`featureFlags`, `apiKeys`, `authorization`) are not new in v9 — they already existed in v8. Only the methods themselves were relocated.

#### Moved from `organizations`

| Before                                                                              | After                                                                              |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `workos.organizations.listOrganizationRoles({ organizationId })`                    | `workos.authorization.listOrganizationRoles(organizationId)` _(signature changed)_ |
| `workos.organizations.listOrganizationFeatureFlags({ organizationId, ...options })` | `workos.featureFlags.listOrganizationFeatureFlags({ organizationId, ...options })` |
| `workos.organizations.listOrganizationApiKeys({ organizationId, ...options })`      | `workos.apiKeys.listOrganizationApiKeys({ organizationId, ...options })`           |
| `workos.organizations.createOrganizationApiKey({ organizationId, ...payload })`     | `workos.apiKeys.createOrganizationApiKey({ organizationId, ...payload })`          |

`listOrganizationRoles` also changed its call signature — it now takes a positional string instead of an options object:

**Before (v8):**

```typescript
const roles = await workos.organizations.listOrganizationRoles({
  organizationId: 'org_123',
});
```

**After (v9):**

```typescript
const roles = await workos.authorization.listOrganizationRoles('org_123');
```

#### Moved from `userManagement`

| Before                                                | After                                                  |
| ----------------------------------------------------- | ------------------------------------------------------ |
| `workos.userManagement.enrollAuthFactor(payload)`     | `workos.multiFactorAuth.createUserAuthFactor(payload)` |
| `workos.userManagement.listAuthFactors(options)`      | `workos.multiFactorAuth.listUserAuthFactors(options)`  |
| `workos.userManagement.listUserFeatureFlags(options)` | `workos.featureFlags.listUserFeatureFlags(options)`    |

**Before (v8):**

```typescript
await workos.organizations.createOrganizationApiKey({
  organizationId: 'org_123',
  name: 'CI key',
});

await workos.userManagement.enrollAuthFactor({
  userId: 'user_123',
  type: 'totp',
});
```

**After (v9):**

```typescript
await workos.apiKeys.createOrganizationApiKey({
  organizationId: 'org_123',
  name: 'CI key',
});

await workos.multiFactorAuth.createUserAuthFactor({
  userId: 'user_123',
  type: 'totp',
});
```

### Error and Webhook Behavior

If you are upgrading to the latest v9 release, not just `9.0.0`, there are a couple of additional behavior changes to be aware of.

#### Typed server and authentication errors

The v9 update adds better typing around server error payloads.

- `GenericServerException` exposes typed error payload data
- `AuthenticationException` was added for known authentication error codes
- `WorkOSResponseError` was made structurally compatible with typed error payloads

This is intended to make strict TypeScript error handling easier, especially if you inspect WorkOS error codes.

#### Unrecognized webhook events

The v9 update also tightens webhook/event deserialization behavior for unknown event types.

If your integration assumed unknown event types would be ignored or treated loosely, re-test webhook handling on the latest v9 release.
