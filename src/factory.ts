// @oagen-ignore-file
import { WorkOS } from './workos';
import type { UserManagement } from './user-management/user-management';
import type { SSO } from './sso/sso';
import type { PKCE } from './pkce/pkce';
import type { WorkOSOptions } from './common/interfaces';
import type { Credentials } from './common/net/credentials';

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
  | 'getJwksUrl'
  | 'verifyAccessToken';

/**
 * SSO method names available without API key.
 */
type PublicSSOMethods =
  'getAuthorizationUrl' | 'getAuthorizationUrlWithPKCE' | 'getProfileAndToken';

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
  /** Discriminant: a client with credentials is not a public client */
  credentials?: never;
}

/**
 * Options for creating a confidential client (with API key).
 */
export interface ConfidentialClientOptions extends WorkOSOptions {
  apiKey: string;
  /** An API key and credentials together are an error */
  credentials?: never;
}

/**
 * Options for creating a client that authorizes with credentials, such as
 * `WorkloadIdentityCredentials`, in place of an API key.
 */
export interface CredentialsClientOptions extends Omit<
  WorkOSOptions,
  'apiKey'
> {
  credentials: Credentials;
  /** An API key and credentials together are an error */
  apiKey?: never;
}

/**
 * Create a type-safe WorkOS client.
 *
 * Returns a narrowed `PublicWorkOS` type when only `clientId` is provided,
 * ensuring compile-time safety for public client usage. Returns the full
 * `WorkOS` type when an API key or `credentials` is provided.
 *
 * Unlike the `WorkOS` constructor, this factory does NOT read from
 * environment variables. Pass the API key or `credentials` explicitly for
 * predictable types.
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
 *
 * @example
 * // Workload identity (server, no API key) - returns full WorkOS
 * const workos = createWorkOS({
 *   credentials: new WorkloadIdentityCredentials({ ... }),
 * });
 * await workos.organizations.listOrganizations(); // OK
 */
export function createWorkOS(options: PublicClientOptions): PublicWorkOS;
export function createWorkOS(options: ConfidentialClientOptions): WorkOS;
export function createWorkOS(options: CredentialsClientOptions): WorkOS;
export function createWorkOS(
  options:
    PublicClientOptions | ConfidentialClientOptions | CredentialsClientOptions,
): PublicWorkOS | WorkOS {
  return new WorkOS(options);
}
