import type {
  AuthenticationRadarRiskDetectedEventData,
  AuthenticationRadarRiskDetectedEventResponseData,
} from '../interfaces';

export const deserializeAuthenticationRadarRiskDetectedEvent = (
  authenticationRadarRiskDetectedEvent: AuthenticationRadarRiskDetectedEventResponseData,
): AuthenticationRadarRiskDetectedEventData => ({
  authMethod: authenticationRadarRiskDetectedEvent.auth_method,
  action: authenticationRadarRiskDetectedEvent.action,
  control: authenticationRadarRiskDetectedEvent.control,
  blocklistType: authenticationRadarRiskDetectedEvent.blocklist_type,
  ipAddress: authenticationRadarRiskDetectedEvent.ip_address,
  userAgent: authenticationRadarRiskDetectedEvent.user_agent,
  userId: authenticationRadarRiskDetectedEvent.user_id,
  email: authenticationRadarRiskDetectedEvent.email,
});
