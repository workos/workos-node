import {
  Invitation,
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
  token: invitation.token,
  createdAt: invitation.created_at,
  updatedAt: invitation.updated_at,
});
