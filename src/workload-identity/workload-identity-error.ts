// @oagen-ignore-file
import { ERROR_DESCRIPTION_LIMIT } from './constants';

/**
 * Every hint lives in this one table. The wording is pending the final
 * server error contract, so a change is made here and nowhere else.
 */
const HINTS = new Map<string, string>([
  // OAuth codes returned by the token endpoint.
  [
    'invalid_grant',
    'The identity token did not match a trust rule for this application, or the token has expired. Check the issuer, audience and subject claims against the trust rule.',
  ],
  [
    'invalid_target',
    "The resource or audience is wrong. The trust rule's audience must match the audience the identity token was requested with, and the resource must be registered for the environment.",
  ],
  [
    'invalid_client',
    'Check that the client ID is the M2M application that has the trust rule.',
  ],
  [
    'unauthorized_client',
    'This application is not allowed to use workload identity federation. Check that the feature is enabled for the environment and that the application has a trust rule.',
  ],
  [
    'invalid_scope',
    'The requested scope is not allowed for this application. Fix the scope or leave it unset.',
  ],
  [
    'invalid_request',
    'The token request was malformed. Check that the token URL points at the `/oauth2/token` endpoint.',
  ],
  // Codes the SDK assigns to failures that have no OAuth code.
  [
    'exchange_failed',
    'The token endpoint could not be reached or kept failing. Check the token URL and try again.',
  ],
  [
    'invalid_response',
    'The token endpoint returned a response the SDK could not read. Check that the token URL points at the `/oauth2/token` endpoint.',
  ],
  [
    'provider_failed',
    'The identity token provider failed, so there was no token to exchange.',
  ],
  [
    'invalid_configuration',
    'Workload identity credentials are missing a required setting.',
  ],
]);

/** For an OAuth code the table does not list. */
const UNKNOWN_CODE_HINT = 'The token endpoint rejected the exchange.';

/**
 * A workload identity failure: a rejected or unreachable token exchange, a
 * failing identity token provider, or incomplete configuration.
 *
 * The message is `<code>: <hint>`, followed by the description when there is
 * one. It never contains the identity token or the access token.
 */
export class WorkloadIdentityError extends Error {
  readonly name = 'WorkloadIdentityError';
  /** The OAuth error code from the token endpoint, or an SDK code. */
  readonly code: string;
  /** The server's `error_description`, or a detail from the SDK. May be empty. */
  readonly description: string;
  /** One sentence on what to check. Never empty. */
  readonly hint: string;

  constructor(
    code: string,
    description?: string,
    options?: { cause?: unknown },
  ) {
    const hint = HINTS.get(code) ?? UNKNOWN_CODE_HINT;
    const text = (description ?? '').slice(0, ERROR_DESCRIPTION_LIMIT);

    super(text ? `${code}: ${hint} ${text}` : `${code}: ${hint}`, options);

    this.code = code;
    this.description = text;
    this.hint = hint;
  }
}
