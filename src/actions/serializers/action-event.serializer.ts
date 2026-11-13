import {
  ActionAuthenticationDeniedEventData,
  ActionAuthenticationDeniedEventResponseData,
  ActionUserRegistrationDeniedEventData,
  ActionUserRegistrationDeniedEventResponseData,
} from '../interfaces/action-event.interface';

export const deserializeActionAuthenticationDeniedEvent = (
  data: ActionAuthenticationDeniedEventResponseData,
): ActionAuthenticationDeniedEventData => ({
  actionEndpointId: data.action_endpoint_id,
  actionExecutionId: data.action_execution_id,
  type: data.type,
  verdict: data.verdict,
  userId: data.user_id,
  organizationId: data.organization_id,
  email: data.email,
  ipAddress: data.ip_address,
  userAgent: data.user_agent,
});

export const deserializeActionUserRegistrationDeniedEvent = (
  data: ActionUserRegistrationDeniedEventResponseData,
): ActionUserRegistrationDeniedEventData => ({
  actionEndpointId: data.action_endpoint_id,
  actionExecutionId: data.action_execution_id,
  type: data.type,
  verdict: data.verdict,
  organizationId: data.organization_id,
  email: data.email,
  ipAddress: data.ip_address,
  userAgent: data.user_agent,
});
