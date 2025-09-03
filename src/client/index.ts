/**
 * Client methods that can be used without a WorkOS API key.
 * These are OAuth client operations suitable for PKCE flows.
 */

// User Management client methods and types
export * as userManagement from './user-management';

// SSO client methods and types
export * as sso from './sso';

// Re-export specific types for convenience
export type {
  AuthorizationURLOptions as UserManagementAuthorizationURLOptions,
  LogoutURLOptions,
} from './user-management';

export type { SSOAuthorizationURLOptions } from './sso';
