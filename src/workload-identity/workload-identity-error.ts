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
    'The identity token was not accepted. Check its issuer, audience and subject claims against the trust rule, and that it has not expired. A token that was already exchanged is also refused: each exchange needs a new identity token.',
  ],
  [
    'invalid_target',
    'The resource is not one the token endpoint accepts. Leave the resource unset to use the default, https://api.workos.com.',
  ],
  [
    'invalid_client',
    'The client ID is unknown, or the application has no enabled trust rule. Check that the client ID is the M2M application that has the trust rule.',
  ],
  [
    'unauthorized_client',
    'This application cannot use workload identity federation. Check that the feature is enabled for your team and that the application is bound to a non-production environment.',
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
