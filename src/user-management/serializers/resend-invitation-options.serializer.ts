import {
  ResendInvitationOptions,
  SerializedResendInvitationOptions,
} from '../interfaces/resend-invitation-options.interface';

export const serializeResendInvitationOptions = (
  options: ResendInvitationOptions,
): SerializedResendInvitationOptions => ({
  locale: options.locale,
});
