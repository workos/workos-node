export interface SendInvitationOptions<TRole extends string = string> {
  email: string;
  organizationId?: string;
  expiresInDays?: number;
  inviterUserId?: string;
  roleSlug?: TRole;
}

export interface SerializedSendInvitationOptions<TRole extends string = string> {
  email: string;
  organization_id?: string;
  expires_in_days?: number;
  inviter_user_id?: string;
  role_slug?: TRole;
}
