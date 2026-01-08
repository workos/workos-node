import { WorkOS } from './workos';
import type { UserManagement } from './user-management/user-management';
import type { SSO } from './sso/sso';
import type { PKCE } from './pkce/pkce';
import type { WorkOSOptions } from './common/interfaces';

/**
 * Method names available without API key - single source of truth.
 * Add new public methods here to expose them on PublicUserManagement.
 */
type PublicUserManagementMethods =
  | 'getAuthorizationUrl'
  | 'getAuthorizationUrlWithPKCE'
  | 'authenticateWithCode'
  | 'authenticateWithCodeAndVerifier'
  | 'authenticateWithRefreshToken'
  | 'getLogoutUrl'
  | 'getJwksUrl';

/**
 * SSO method names available without API key.
 */
type PublicSSOMethods =
  | 'getAuthorizationUrl'
  | 'getAuthorizationUrlWithPKCE'
  | 'getProfileAndToken';

/**
 * Subset of UserManagement methods available without an API key.
 * Used by public clients (browser, mobile, CLI, desktop apps).
 */
export type PublicUserManagement = Pick<
  UserManagement,
  PublicUserManagementMethods
>;

/**
 * Subset of SSO methods available without an API key.
 */
export type PublicSSO = Pick<SSO, PublicSSOMethods>;

/**
 * WorkOS client for public/PKCE-only usage.
 * Returned when initialized with only clientId (no API key).
 *
 * For browser, mobile, CLI, and desktop applications that cannot
 * securely store an API key.
 */
export interface PublicWorkOS {
  readonly baseURL: string;
  readonly clientId: string;
  readonly pkce: PKCE;
  readonly userManagement: PublicUserManagement;
  readonly sso: PublicSSO;
}

/**
 * Options for creating a public client (PKCE-only, no API key).
 */
export interface PublicClientOptions extends Omit<WorkOSOptions, 'apiKey'> {
  clientId: string;
  /** Discriminant: ensures TypeScript selects PublicWorkOS overload when apiKey is absent */
  apiKey?: never;
}

/**
 * Options for creating a confidential client (with API key).
 */
export interface ConfidentialClientOptions extends WorkOSOptions {
  apiKey: string;
}

/**
 * Create a type-safe WorkOS client.
 *
 * Returns a narrowed `PublicWorkOS` type when only `clientId` is provided,
 * ensuring compile-time safety for public client usage. Returns the full
 * `WorkOS` type when an API key is provided.
 *
 * Unlike the `WorkOS` constructor, this factory does NOT read from
 * environment variables. Pass credentials explicitly for predictable types.
 *
 * @example
 * // Public client (browser, mobile, CLI) - returns PublicWorkOS
 * const workos = createWorkOS({ clientId: 'client_123' });
 * await workos.userManagement.getAuthorizationUrlWithPKCE({...}); // OK
 * workos.userManagement.listUsers(); // TypeScript error!
 *
 * @example
 * // Confidential client (server) - returns full WorkOS
 * const workos = createWorkOS({
 *   apiKey: process.env.WORKOS_API_KEY!,
 *   clientId: 'client_123'
 * });
 * await workos.userManagement.listUsers(); // OK
 */
export function createWorkOS(options: PublicClientOptions): PublicWorkOS;
export function createWorkOS(options: ConfidentialClientOptions): WorkOS;
export function createWorkOS(
  options: PublicClientOptions | ConfidentialClientOptions,
): PublicWorkOS | WorkOS {
  return new WorkOS(options);
}
