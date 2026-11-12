// @oagen-ignore-file

/** Sent with the environment ID on every workload identity API request. */
export const ENVIRONMENT_ID_HEADER = 'x-url-environment-id';

export const JWT_BEARER_GRANT_TYPE =
  'urn:ietf:params:oauth:grant-type:jwt-bearer';

export const DEFAULT_RESOURCE = 'https://api.workos.com';

/** Used when the token response has no usable `expires_in`. */
export const DEFAULT_TOKEN_LIFETIME_SECONDS = 300;

/**
 * A token is replaced once less than `min(60 seconds, 20% of its lifetime)`
 * remains.
 */
export const REFRESH_THRESHOLD_MAX_MS = 60_000;
export const REFRESH_THRESHOLD_LIFETIME_FRACTION = 0.2;

/** Bounds one whole exchange, including its retries and backoff. */
export const EXCHANGE_DEADLINE_MS = 30_000;

/** The server's `error_description` is cut to this many characters. */
export const ERROR_DESCRIPTION_LIMIT = 500;
