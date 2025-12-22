/**
 * Client methods that can be used without a WorkOS API key.
 * These are OAuth client operations and URL builders suitable for PKCE flows.
 */

// Export client methods directly - this is the recommended approach
export * as userManagement from './client/user-management';
export * as sso from './client/sso';

// Re-export types for convenience
export type {
  AuthorizationURLOptions as UserManagementAuthorizationURLOptions,
  LogoutURLOptions,
} from './client/user-management';

export type { SSOAuthorizationURLOptions } from './client/sso';

// Note: If you need authenticateWithCodeAndVerifier, use the full WorkOS SDK
// as it requires server-side API key authentication
