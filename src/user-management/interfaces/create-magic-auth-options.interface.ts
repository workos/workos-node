export interface CreateMagicAuthOptions {
  email: string;
  invitationToken?: string;
  ipAddress?: string;
  userAgent?: string;
  radarAuthAttemptId?: string;
}

export interface SerializedCreateMagicAuthOptions {
  email: string;
  invitation_token?: string;
  ip_address?: string;
  user_agent?: string;
  radar_auth_attempt_id?: string;
}
