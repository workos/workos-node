export interface SendRadarSmsChallengeOptions {
  userId: string;
  pendingAuthenticationToken: string;
  phoneNumber: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SerializedSendRadarSmsChallengeOptions {
  user_id: string;
  pending_authentication_token: string;
  phone_number: string;
  ip_address?: string;
  user_agent?: string;
}

export interface SendRadarSmsChallengeResponse {
  verificationId: string;
  phoneNumber: string;
}

export interface SendRadarSmsChallengeResponseResponse {
  verification_id: string;
  phone_number: string;
}
