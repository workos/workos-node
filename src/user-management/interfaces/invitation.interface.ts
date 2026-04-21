export interface Invitation {
  /** Distinguishes the invitation object. */
  object: 'invitation';
  /** The unique ID of the invitation. */
  id: string;
  /** The email address of the recipient. */
  email: string;
  /** The state of the invitation. */
  state: 'pending' | 'accepted' | 'expired' | 'revoked';
  /** The timestamp when the invitation was accepted, or null if not yet accepted. */
  acceptedAt: string | null;
  /** The timestamp when the invitation was revoked, or null if not revoked. */
  revokedAt: string | null;
  /** The timestamp when the invitation expires. */
  expiresAt: string;
  /** The ID of the [organization](https://workos.com/docs/reference/organization) that the recipient will join. */
  organizationId: string | null;
  /** The ID of the user who invited the recipient, if provided. */
  inviterUserId: string | null;
  /** The ID of the user who accepted the invitation, once accepted. */
  acceptedUserId: string | null;
  roleSlug: string | null;
  /** The token used to accept the invitation. */
  token: string;
  /** The URL where the recipient can accept the invitation. */
  acceptInvitationUrl: string;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface InvitationEvent {
  object: 'invitation';
  id: string;
  email: string;
  state: 'pending' | 'accepted' | 'expired' | 'revoked';
  acceptedAt: string | null;
  revokedAt: string | null;
  expiresAt: string;
  organizationId: string | null;
  inviterUserId: string | null;
  acceptedUserId: string | null;
  roleSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationResponse {
  object: 'invitation';
  id: string;
  email: string;
  state: 'pending' | 'accepted' | 'expired' | 'revoked';
  accepted_at: string | null;
  revoked_at: string | null;
  expires_at: string;
  organization_id: string | null;
  inviter_user_id: string | null;
  accepted_user_id: string | null;
  role_slug: string | null;
  token: string;
  accept_invitation_url: string;
  created_at: string;
  updated_at: string;
}

export interface InvitationEventResponse {
  object: 'invitation';
  id: string;
  email: string;
  state: 'pending' | 'accepted' | 'expired' | 'revoked';
  accepted_at: string | null;
  revoked_at: string | null;
  expires_at: string;
  organization_id: string | null;
  inviter_user_id: string | null;
  accepted_user_id: string | null;
  role_slug: string | null;
  created_at: string;
  updated_at: string;
}
