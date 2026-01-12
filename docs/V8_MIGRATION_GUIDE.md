# WorkOS Node SDK v8 Migration Guide

This guide will help you migrate from v7 to v8 of the WorkOS Node SDK.

## Table of Contents

- [Quick Start](#quick-start)
- [Node.js Version Requirement](#nodejs-version-requirement)
- [Package Type Changes](#package-type-changes)
- [New Features](#new-features)
  - [PKCE Authentication](#pkce-authentication)
  - [Type-Safe Client Factory](#type-safe-client-factory)
- [Breaking Changes by Module](#breaking-changes-by-module)
  - [Directory Sync](#directory-sync)
  - [User Management](#user-management)
  - [SSO](#sso)
  - [MFA](#mfa)
  - [Organizations](#organizations)
  - [Vault](#vault)
  - [Events](#events)

---

## Quick Start

1. **Update Node.js**: Ensure you're running Node.js 20 or higher
2. **Update the package**: `npm install @workos-inc/node@8`
3. **Run tests**: Check for TypeScript errors and runtime issues
4. **Review breaking changes**: See sections below for specific migrations

---

## Node.js Version Requirement

**Minimum Node.js version is now 20+** (previously 16+)

Node.js 18 reached end-of-life in April 2025. If you're still on Node 18 or earlier, upgrade before migrating to v8.

```bash
# Check your Node version
node --version

# If below v20, upgrade Node.js first
# https://nodejs.org/
```

---

## Package Type Changes

The package is now **ESM-first** with dual CJS/ESM exports.

### What this means:

- If you use `import` (ESM), nothing changes
- If you use `require` (CommonJS), it still works via conditional exports
- TypeScript types are properly exported for both module systems

### Most projects won't need changes

The SDK uses conditional exports, so your bundler/runtime will automatically use the right build:

```typescript
// ESM - works
import { WorkOS } from '@workos-inc/node';

// CommonJS - still works
const { WorkOS } = require('@workos-inc/node');

// Cloudflare Workers - use /worker
import { WorkOS } from '@workos-inc/node/worker';
```

### If you have custom build configurations

If you're doing deep imports or have custom bundler configs, you may need adjustments. The internal file structure has changed to support dual builds.

**Before (v7):**
```typescript
// ❌ Deep imports no longer work
import { NodeHttpClient } from '@workos-inc/node/lib/common/net/node-client';
```

**After (v8):**
```typescript
// ✅ Use the public API
import { WorkOS } from '@workos-inc/node';
const workos = new WorkOS({ apiKey: 'sk_...' });
```

---

## New Features

### PKCE Authentication

v8 adds full PKCE (Proof Key for Code Exchange) support for public clients.

#### What is PKCE?

PKCE enables secure authentication in mobile apps, desktop apps, and SPAs without exposing your API key. Previously, you needed a backend proxy to handle auth. Not anymore.

#### Using PKCE

**Option 1: Automatic PKCE (Recommended)**

```typescript
import { WorkOS } from '@workos-inc/node';

// Initialize with just clientId (no API key for public clients)
const workos = new WorkOS({ clientId: 'client_123' });

// Generate authorization URL with PKCE
const { url, state, codeVerifier } = await workos.userManagement.getAuthorizationUrlWithPKCE({
  redirectUri: 'myapp://callback',
  provider: 'authkit',
});

// Store codeVerifier securely (in-memory, secure storage, etc.)
// Redirect user to url...

// After user authenticates and you receive the code:
const { accessToken, refreshToken, user } = await workos.userManagement.authenticateWithCode({
  code: authCode,
  codeVerifier, // Use the codeVerifier from earlier
});
```

**Option 2: Manual PKCE**

```typescript
// Generate PKCE manually
const { codeVerifier, codeChallenge } = workos.pkce.generate();

// Use in authorization URL
const url = workos.userManagement.getAuthorizationUrl({
  redirectUri: 'myapp://callback',
  provider: 'authkit',
  codeChallenge,
  codeChallengeMethod: 'S256',
});
```

**Option 3: Server-side (no changes needed)**

If you're using the SDK server-side with an API key, nothing changes:

```typescript
// Still works exactly the same
const workos = new WorkOS({ apiKey: 'sk_...', clientId: 'client_123' });

const { accessToken, user } = await workos.userManagement.authenticateWithCode({
  code: authCode,
});
```

### Type-Safe Client Factory

v8 introduces `createWorkOS()` for compile-time type safety.

#### Problem it solves

In v7, you could accidentally call server-only methods on a public client:

```typescript
// v7 - Runtime error, but TypeScript allows it
const workos = new WorkOS({ clientId: 'client_123' }); // No API key
await workos.userManagement.listUsers(); // ❌ Fails at runtime
```

#### Solution: createWorkOS()

```typescript
import { createWorkOS } from '@workos-inc/node';

// Public client - TypeScript knows what's available
const publicClient = createWorkOS({ clientId: 'client_123' });
publicClient.userManagement.getAuthorizationUrlWithPKCE({ ... }); // ✅ Works
publicClient.userManagement.listUsers(); // ❌ TypeScript error - method doesn't exist

// Confidential client - full API access
const serverClient = createWorkOS({ apiKey: 'sk_...', clientId: 'client_123' });
serverClient.userManagement.listUsers(); // ✅ Works
```

**When to use:**
- Use `createWorkOS()` for type safety when building public vs server apps
- Use `new WorkOS()` if you don't need compile-time enforcement

---

## Breaking Changes by Module

### Directory Sync

#### DirectoryUser fields moved to customAttributes

User fields are now in `customAttributes` to better match the API structure.

**Before (v7):**
```typescript
const user = await workos.directorySync.getUser({ user: 'directory_user_123' });

console.log(user.emails);    // Primary email
console.log(user.username);  // Username
console.log(user.jobTitle);  // Job title
```

**After (v8):**
```typescript
const user = await workos.directorySync.getUser({ user: 'directory_user_123' });

console.log(user.customAttributes?.emails);    // Array of emails
console.log(user.customAttributes?.username);  // Username
console.log(user.customAttributes?.jobTitle);  // Job title
```

#### getPrimaryEmail() utility removed

The `getPrimaryEmail()` helper function has been removed.

**Before (v7):**
```typescript
import { getPrimaryEmail } from '@workos-inc/node';

const email = getPrimaryEmail(user);
```

**After (v8):**
```typescript
// Option 1: Access directly
const primaryEmail = user.customAttributes?.emails?.[0];

// Option 2: Create your own helper
function getPrimaryEmail(user: DirectoryUser): string | undefined {
  return user.customAttributes?.emails?.[0];
}
```

### User Management

#### Removed deprecated methods

Several methods have been removed. They were deprecated in v6 and v7.

**sendMagicAuthCode() removed**

**Before (v7):**
```typescript
await workos.sendMagicAuthCode({ email: 'user@example.com' });
```

**After (v8):**
```typescript
await workos.userManagement.sendMagicCode({ email: 'user@example.com' });
```

**sendPasswordResetEmail() removed**

**Before (v7):**
```typescript
await workos.sendPasswordResetEmail({ email: 'user@example.com' });
```

**After (v8):**
```typescript
await workos.userManagement.sendPasswordResetEmail({ email: 'user@example.com' });
```

**refreshAndSealSessionData() removed**

**Before (v7):**
```typescript
const session = await workos.userManagement.refreshAndSealSessionData({
  sessionData: encryptedSession,
  cookiePassword: 'secret',
});
```

**After (v8):**
```typescript
// Use the new session helper methods
import { refreshSession, sealSession } from '@workos-inc/node';

const refreshedSession = await refreshSession({
  sessionData: session,
  organizationId: 'org_123',
});

const sealed = await sealSession({
  sessionData: refreshedSession,
  cookiePassword: 'secret',
});
```

#### AuthorizationURLOptions: context field removed

The `context` field is no longer supported.

**Before (v7):**
```typescript
const url = workos.userManagement.getAuthorizationUrl({
  provider: 'authkit',
  redirectUri: 'https://example.com/callback',
  context: { foo: 'bar' }, // ❌ No longer supported
});
```

**After (v8):**
```typescript
const url = workos.userManagement.getAuthorizationUrl({
  provider: 'authkit',
  redirectUri: 'https://example.com/callback',
  // Use state parameter for client-side data
  state: 'your-state-data',
});
```

#### listOrganizationMemberships now requires userId or organizationId

You can no longer call `listOrganizationMemberships()` without parameters.

**Before (v7):**
```typescript
// ❌ No longer works
const memberships = await workos.userManagement.listOrganizationMemberships();
```

**After (v8):**
```typescript
// ✅ Specify userId OR organizationId
const memberships = await workos.userManagement.listOrganizationMemberships({
  userId: 'user_123',
});

// OR
const memberships = await workos.userManagement.listOrganizationMemberships({
  organizationId: 'org_456',
});
```

### SSO

#### SSOAuthorizationURLOptions type changes

Options are now a **discriminated union**. You must specify exactly one of: `connection`, `organization`, or `provider`.

**Before (v7):**
```typescript
// TypeScript allowed this, but it was ambiguous
const url = workos.sso.getAuthorizationUrl({
  connection: 'conn_123',
  organization: 'org_456', // Both allowed
  redirectUri: 'https://example.com/callback',
});
```

**After (v8):**
```typescript
// ✅ Specify exactly one
const url = workos.sso.getAuthorizationUrl({
  connection: 'conn_123', // OR organization OR provider (not multiple)
  redirectUri: 'https://example.com/callback',
});

// TypeScript will error if you try to specify multiple:
const url = workos.sso.getAuthorizationUrl({
  connection: 'conn_123',
  organization: 'org_456', // ❌ TypeScript error
  redirectUri: 'https://example.com/callback',
});
```

#### domain field removed

The deprecated `domain` field has been removed.

**Before (v7):**
```typescript
const url = workos.sso.getAuthorizationUrl({
  domain: 'example.com', // ❌ Removed
  redirectUri: 'https://example.com/callback',
});
```

**After (v8):**
```typescript
const url = workos.sso.getAuthorizationUrl({
  organization: 'org_123', // Use organization instead
  redirectUri: 'https://example.com/callback',
});
```

### MFA

#### verifyFactor() removed

Use `verifyChallenge()` instead (same functionality).

**Before (v7):**
```typescript
const result = await workos.mfa.verifyFactor({
  authenticationFactorId: 'auth_factor_123',
  code: '123456',
});
```

**After (v8):**
```typescript
const result = await workos.mfa.verifyChallenge({
  authenticationFactorId: 'auth_factor_123',
  code: '123456',
});
```

### Organizations

#### Removed fields from CreateOrganizationOptions and UpdateOrganizationOptions

**allowProfilesOutsideOrganization removed**

**Before (v7):**
```typescript
await workos.organizations.createOrganization({
  name: 'Acme Corp',
  allowProfilesOutsideOrganization: true, // ❌ Removed
});
```

**After (v8):**
```typescript
await workos.organizations.createOrganization({
  name: 'Acme Corp',
  // Field removed - use API settings instead
});
```

**domains field removed (use domainData instead)**

**Before (v7):**
```typescript
await workos.organizations.createOrganization({
  name: 'Acme Corp',
  domains: ['example.com'], // ❌ Removed
});
```

**After (v8):**
```typescript
await workos.organizations.createOrganization({
  name: 'Acme Corp',
  domainData: [{ domain: 'example.com', state: 'verified' }], // ✅ Use domainData
});
```

#### OrganizationDomainState enum change

`LegacyVerified` removed from enum.

**Before (v7):**
```typescript
if (domain.state === 'legacy_verified') { // ❌ No longer exists
  // ...
}
```

**After (v8):**
```typescript
if (domain.state === 'verified') { // ✅ Use 'verified'
  // ...
}
```

### Vault

#### Removed deprecated method aliases

All `*Secret` methods removed. Use `*Object` methods instead.

| Removed (v7)           | Use Instead (v8)       |
|------------------------|------------------------|
| `createSecret()`       | `createObject()`       |
| `listSecrets()`        | `listObjects()`        |
| `listSecretVersions()` | `listObjectVersions()` |
| `readSecret()`         | `readObject()`         |
| `describeSecret()`     | `describeObject()`     |
| `updateSecret()`       | `updateObject()`       |
| `deleteSecret()`       | `deleteObject()`       |

**Before (v7):**
```typescript
const secret = await workos.vault.createSecret({
  name: 'api-key',
  value: 'sk_test_123',
});
```

**After (v8):**
```typescript
const object = await workos.vault.createObject({
  name: 'api-key',
  value: 'sk_test_123',
});
```

### Events

#### Event type changes

**dsync.deactivated removed**

**Before (v7):**
```typescript
if (event.event === 'dsync.deactivated') {
  // Handle deactivated event
}
```

**After (v8):**
```typescript
if (event.event === 'dsync.deleted') { // ✅ Use dsync.deleted
  // Handle deleted event
}
```

**Organization membership events removed**

- `OrganizationMembershipAdded` - Not applicable in v8
- `OrganizationMembershipRemoved` - Not applicable in v8

If you were using these events, contact WorkOS support for migration guidance.

---

## Internal Changes (Non-Breaking)

These changes shouldn't affect your code, but are worth knowing:

### HTTP and Crypto Providers Removed

Internal classes like `NodeHttpClient`, `NodeCryptoProvider`, and iron-session providers have been removed. If you were importing these directly (not recommended), use the main `WorkOS` class instead.

### Build System Migration

We migrated from `tsc` to `tsdown` for faster builds and better runtime compatibility. This doesn't affect usage but results in:
- Smaller bundle sizes
- Better tree-shaking
- Improved compatibility with edge runtimes

### Dependency Updates

- Using `iron-webcrypto` v2 instead of `iron-session`
- Removed external `leb` and `qs` packages (internal implementations)
- Migrated from TSLint to ESLint

---

## Testing Your Migration

After migrating, run these checks:

1. **TypeScript compilation**: `npx tsc --noEmit`
2. **Unit tests**: Ensure all tests pass
3. **Runtime testing**: Test auth flows end-to-end
4. **Check deprecation warnings**: Look for any warnings in your logs

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/workos/workos-node/issues)
- **Slack**: WorkOS Community Slack
- **Docs**: [WorkOS Documentation](https://workos.com/docs)

---

## Summary Checklist

- [ ] Upgraded to Node.js 20+
- [ ] Installed v8: `npm install @workos-inc/node@8`
- [ ] Updated Directory Sync to use `customAttributes`
- [ ] Replaced `getPrimaryEmail()` if used
- [ ] Migrated deprecated User Management methods
- [ ] Updated SSO authorization options to discriminated union
- [ ] Changed `verifyFactor()` to `verifyChallenge()`
- [ ] Removed `allowProfilesOutsideOrganization` from Organizations
- [ ] Updated Vault methods from `*Secret` to `*Object`
- [ ] Updated event types (`dsync.deactivated` → `dsync.deleted`)
- [ ] Tested PKCE flows if building public clients
- [ ] Ran tests and verified everything works
