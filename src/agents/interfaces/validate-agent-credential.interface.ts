/** The type of agent credential to validate. */
export type AgentCredentialType = 'api_key' | 'access_token';

export interface ValidateAgentApiKeyOptions {
  type: 'api_key';
  /** The opaque API key value to validate. */
  credential: string;
}

export interface ValidateAgentAccessTokenOptions {
  type: 'access_token';
  /** The access token (JWT) to validate. */
  credential: string;
  /**
   * When `true`, additionally calls the WorkOS API to check whether the token
   * has been revoked. When `false` or omitted, the token is only decoded and
   * verified locally against the environment's JWKS — a revoked but
   * not-yet-expired token will still report as valid.
   */
  checkForRevoked?: boolean;
}

/**
 * Options for validating an agent credential. `checkForRevoked` is only
 * available for `access_token` credentials.
 */
export type ValidateAgentCredentialOptions =
  | ValidateAgentApiKeyOptions
  | ValidateAgentAccessTokenOptions;

export interface SerializedValidateAgentCredentialOptions {
  type: AgentCredentialType;
  credential: string;
}

/** The decoded claims of an agent access token. */
export interface AgentAccessTokenClaims {
  /** The token issuer (`iss`). */
  issuer?: string;
  /** The token audience (`aud`). */
  audience?: string | string[];
  /** Unique identifier of the agent registration the token was issued for (`sub`). */
  registrationId: string;
  /** The token's unique identifier (`jti`). */
  jwtId: string;
  /** Unique identifier of the Organization the registration belongs to. */
  organizationId: string;
  /** The space-separated scopes granted to the token, if any (`scope`). */
  scope?: string;
  /** The actor the token acts on behalf of, if any (`act`). */
  actor?: { sub: string };
  /** The time the token expires, in seconds since the epoch (`exp`). */
  expiresAt?: number;
  /** The time the token was issued, in seconds since the epoch (`iat`). */
  issuedAt?: number;
}

/** The raw JWT payload of an agent access token, as encoded in the token. */
export interface SerializedAgentAccessTokenClaims {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  jti?: string;
  organization_id?: string;
  scope?: string;
  act?: { sub: string };
  exp?: number;
  iat?: number;
}

/** The result of validating an agent credential. */
export interface AgentCredentialValidation {
  /** Whether the credential is valid. */
  valid: boolean;
  /**
   * Unique identifier of the agent registration the credential was issued for,
   * or `null` when the credential is invalid.
   */
  registrationId: string | null;
  /**
   * An ISO 8601 timestamp of when the credential expires, or `null` when it
   * does not expire or is invalid.
   */
  expiresAt: string | null;
  /**
   * The decoded claims of the access token. Only populated for valid
   * `access_token` credentials; `null` for API keys and invalid tokens.
   */
  claims: AgentAccessTokenClaims | null;
}

export interface SerializedAgentCredentialValidation {
  valid: boolean;
  registration_id: string | null;
  expires_at: string | null;
}
