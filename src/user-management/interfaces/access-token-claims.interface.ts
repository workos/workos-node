import { UserManagementAccessToken } from './authenticate-with-session-cookie.interface';

/**
 * The claims of a verified WorkOS access token, as returned by
 * `userManagement.verifyAccessToken()`.
 *
 * Combines the registered JWT claims WorkOS sets with the session claims in
 * {@link UserManagementAccessToken}. Any other claims present on the token,
 * such as custom claims configured for the environment, are available through
 * the index signature.
 */
export interface AccessTokenClaims extends UserManagementAccessToken {
  /** The ID of the user the token was issued to. */
  sub: string;
  /** The issuer of the token. */
  iss: string;
  /** When the token expires, in seconds since the Unix epoch. */
  exp: number;
  /** When the token was issued, in seconds since the Unix epoch. */
  iat: number;
  /** When the user last actively authenticated, in seconds since the Unix epoch. */
  auth_time?: number;
  [claim: string]: unknown;
}
