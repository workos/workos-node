import {
  SendRadarSmsChallengeOptions,
  SerializedSendRadarSmsChallengeOptions,
} from '../interfaces/send-radar-sms-challenge-options.interface';

export const serializeSendRadarSmsChallengeOptions = (
  options: SendRadarSmsChallengeOptions,
): SerializedSendRadarSmsChallengeOptions => ({
  user_id: options.userId,
  pending_authentication_token: options.pendingAuthenticationToken,
  phone_number: options.phoneNumber,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
