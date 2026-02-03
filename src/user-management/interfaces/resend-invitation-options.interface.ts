import { Locale } from './locale.interface';

export interface ResendInvitationOptions {
  invitationId: string;
  locale?: Locale;
}

export interface SerializedResendInvitationOptions {
  locale?: Locale;
}
