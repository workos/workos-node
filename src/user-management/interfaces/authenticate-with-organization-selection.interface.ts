export interface AuthenticateWithOrganizationSelectionOptions {
  clientId: string;
  code: string;
  organizationId: string;
  pendingAuthenticationToken: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticateUserWithOrganizationSelectionCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateWithOrganizationSelectionOptions {
  grant_type: 'urn:workos:oauth:grant-type:organization-selection';
  client_id: string;
  client_secret: string | undefined;
  organization_id: string;
  pending_authentication_token: string;
  ip_address?: string;
  user_agent?: string;
}
