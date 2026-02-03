import {} from '../interfaces';
import {
  SendInvitationOptions,
  SerializedSendInvitationOptions,
} from '../interfaces/send-invitation-options.interface';

export const serializeSendInvitationOptions = (
  options: SendInvitationOptions,
): SerializedSendInvitationOptions => ({
  email: options.email,
  organization_id: options.organizationId,
  expires_in_days: options.expiresInDays,
  inviter_user_id: options.inviterUserId,
  role_slug: options.roleSlug,
  locale: options.locale,
});
