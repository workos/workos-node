export interface SendInvitationOptions {
  email: string;
  organizationId?: string;
  expiresInDays?: number;
  inviterUserId?: string;
}

export interface SerializedSendInvitationOptions {
  email: string;
  organization_id?: string;
  expires_in_days?: number;
  inviter_user_id?: string;
}
