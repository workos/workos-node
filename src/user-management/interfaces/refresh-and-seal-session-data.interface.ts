import { AuthenticateWithSessionCookieSuccessResponse } from './authenticate-with-session-cookie.interface';
import { AuthenticationResponse } from './authentication-response.interface';

export enum RefreshSessionFailureReason {
  INVALID_SESSION_COOKIE = 'invalid_session_cookie',
  NO_SESSION_COOKIE_PROVIDED = 'no_session_cookie_provided',

  // Terminal API OauthErrors — the session is over and the user must
  // re-authenticate.
  INVALID_GRANT = 'invalid_grant',
  MFA_ENROLLMENT = 'mfa_enrollment',
  SSO_REQUIRED = 'sso_required',

  // Transient failures — the refresh token is likely still valid and the
  // request can be retried. Keep the existing session rather than signing
  // the user out.
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  TIMEOUT = 'timeout',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
}

type RefreshSessionFailedResponse = {
  authenticated: false;
  reason: RefreshSessionFailureReason;
  /**
   * Whether the refresh can safely be retried with the same refresh token.
   * When `true` (e.g. a timeout, `5xx`, or `429`), keep the existing session
   * and retry later. When `false` (e.g. `invalid_grant`), the failure is
   * terminal and the user should be redirected to sign in.
   */
  retryable: boolean;
  /**
   * Seconds the server asked the client to wait before retrying, parsed from
   * the `Retry-After` response header. Only present for some retryable
   * failures (e.g. a `429`).
   */
  retryAfter?: number;
  /**
   * The underlying error, exposed for logging. Only present for retryable
   * failures.
   */
  error?: unknown;
};

type RefreshSessionSuccessResponse = Omit<
  AuthenticateWithSessionCookieSuccessResponse,
  // accessToken is available in the session object and with session
  // helpers isn't necessarily useful to return top level
  'accessToken'
> & {
  authenticated: true;
  session?: AuthenticationResponse;
  sealedSession?: string;
};

export type RefreshSessionResponse =
  | RefreshSessionFailedResponse
  | RefreshSessionSuccessResponse;
