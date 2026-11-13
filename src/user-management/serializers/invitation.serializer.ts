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
  acceptedAt:
    invitation.accepted_at != null ? new Date(invitation.accepted_at) : null,
  revokedAt:
    invitation.revoked_at != null ? new Date(invitation.revoked_at) : null,
  expiresAt: new Date(invitation.expires_at),
  organizationId: invitation.organization_id,
  inviterUserId: invitation.inviter_user_id,
  acceptedUserId: invitation.accepted_user_id,
  roleSlug: invitation.role_slug,
  token: invitation.token,
  acceptInvitationUrl: invitation.accept_invitation_url,
  createdAt: new Date(invitation.created_at),
  updatedAt: new Date(invitation.updated_at),
});

export const deserializeInvitationEvent = (
  invitation: InvitationEventResponse,
): InvitationEvent => ({
  object: invitation.object,
  id: invitation.id,
  email: invitation.email,
  state: invitation.state,
  acceptedAt:
    invitation.accepted_at != null ? new Date(invitation.accepted_at) : null,
  revokedAt:
    invitation.revoked_at != null ? new Date(invitation.revoked_at) : null,
  expiresAt: new Date(invitation.expires_at),
  organizationId: invitation.organization_id,
  inviterUserId: invitation.inviter_user_id,
  acceptedUserId: invitation.accepted_user_id,
  roleSlug: invitation.role_slug,
  createdAt: new Date(invitation.created_at),
  updatedAt: new Date(invitation.updated_at),
});
