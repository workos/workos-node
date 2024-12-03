import {
  Invitation,
  InvitationEvent,
  InvitationEventResponse,
  InvitationResponse,
} from '../interfaces/invitation.interface';

export const deserializeInvitation = (
  invitation: InvitationResponse,
): Invitation => ({
  object: invitation.object,
  id: invitation.id,
  email: invitation.email,
  state: invitation.state,
  acceptedAt: invitation.accepted_at,
  revokedAt: invitation.revoked_at,
  expiresAt: invitation.expires_at,
  organizationId: invitation.organization_id,
  inviterUserId: invitation.inviter_user_id,
  acceptedUserId: invitation.accepted_user_id,
  token: invitation.token,
  acceptInvitationUrl: invitation.accept_invitation_url,
  createdAt: invitation.created_at,
  updatedAt: invitation.updated_at,
});

export const deserializeInvitationEvent = (
  invitation: InvitationEventResponse,
): InvitationEvent => ({
  object: invitation.object,
  id: invitation.id,
  email: invitation.email,
  state: invitation.state,
  acceptedAt: invitation.accepted_at,
  revokedAt: invitation.revoked_at,
  expiresAt: invitation.expires_at,
  organizationId: invitation.organization_id,
  inviterUserId: invitation.inviter_user_id,
  acceptedUserId: invitation.accepted_user_id,
  createdAt: invitation.created_at,
  updatedAt: invitation.updated_at,
});
