import {
  CreateMagicAuthOptions,
  SerializedCreateMagicAuthOptions,
} from '../interfaces';

export const serializeCreateMagicAuthOptions = (
  options: CreateMagicAuthOptions,
): SerializedCreateMagicAuthOptions => ({
  email: options.email,
  invitation_token: options.invitationToken,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
  radar_auth_attempt_id: options.radarAuthAttemptId,
  signals_id: options.signalsId,
});
