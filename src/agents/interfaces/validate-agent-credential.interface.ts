/** The type of agent credential to validate. */
export type AgentCredentialType = 'api_key' | 'access_token';

export interface ValidateAgentCredentialOptions {
  /** The type of credential being validated. */
  type: AgentCredentialType;
  /** The opaque credential value to validate. */
  credential: string;
}

export interface SerializedValidateAgentCredentialOptions {
  type: AgentCredentialType;
  credential: string;
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
}

export interface SerializedAgentCredentialValidation {
  valid: boolean;
  registration_id: string | null;
  expires_at: string | null;
}
