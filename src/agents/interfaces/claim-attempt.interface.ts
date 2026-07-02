import { AgentRegistrationStatus } from './agent-registration.interface';

/** Options for linking an external user to a claim attempt via the admin API. */
export interface LinkClaimAttemptToExternalUserOptions {
  /** The claim attempt token identifying the pending claim. */
  claimAttemptToken: string;
  /** The user to attach to the claim attempt. */
  user: {
    /** The email address of the user. */
    email: string;
    /** The external ID of the user. */
    externalId: string;
  };
  /** The organization to place the agent in. Required when the user belongs to multiple organizations. */
  organizationId?: string;
}

export interface SerializedLinkClaimAttemptToExternalUserOptions {
  type: 'link_external_user';
  claim_attempt_token: string;
  user: {
    email: string;
    external_id: string;
  };
  organization_id?: string;
}

/** An organization the confirming user belongs to, offered as a placement choice. */
export interface ClaimAttemptOrganization {
  /** The organization ID. */
  id: string;
  /** The organization name. */
  name: string;
}

/** The result of linking an external user to a claim attempt. */
export interface ClaimAttemptResponse {
  /** The agent registration ID. */
  id: string;
  /** Current status of the agent registration. */
  status: AgentRegistrationStatus;
  /** The user code the agent needs to complete the claim. */
  userCode: string;
  /** Organizations the user belongs to, offered as placement choices. */
  organizations: ClaimAttemptOrganization[];
}

export interface SerializedClaimAttemptResponse {
  id: string;
  status: AgentRegistrationStatus;
  user_code: string;
  organizations: ClaimAttemptOrganization[];
}
