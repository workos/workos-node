interface ActionDeniedEventDataBase {
  actionEndpointId: string;
  actionExecutionId: string;
  verdict: 'Deny';
  organizationId: string | null;
  email: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface ActionDeniedEventResponseDataBase {
  action_endpoint_id: string;
  action_execution_id: string;
  verdict: 'Deny';
  organization_id: string | null;
  email: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface ActionAuthenticationDeniedEventData extends ActionDeniedEventDataBase {
  type: 'authentication';
  userId: string;
}

export interface ActionAuthenticationDeniedEventResponseData extends ActionDeniedEventResponseDataBase {
  type: 'authentication';
  user_id: string;
}

export interface ActionUserRegistrationDeniedEventData extends ActionDeniedEventDataBase {
  type: 'user_registration';
}

export interface ActionUserRegistrationDeniedEventResponseData extends ActionDeniedEventResponseDataBase {
  type: 'user_registration';
}
