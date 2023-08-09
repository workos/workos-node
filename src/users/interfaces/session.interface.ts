export interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  authorizedOrganizations: AuthorizedOrganization[];
  unauthorizedOrganizations: UnauthorizedOrganization[];
  token: string;
}

interface OrganizationSummary {
  id: string;
  name: string;
}

interface AuthorizedOrganization {
  organization: OrganizationSummary;
}

type SessionAuthenticationMethod =
  | 'GoogleOauth'
  | 'MagicAuth'
  | 'MicrosoftOauth'
  | 'Password';

export type UnauthorizedOrganizationReason = {
  type: 'authentication_method_required';
  allowedAuthenticationMethods: SessionAuthenticationMethod[];
};

export type UnauthorizedOrganizationReasonResponse = {
  type: 'authentication_method_required';
  allowed_authentication_methods: SessionAuthenticationMethod[];
};

export interface UnauthorizedOrganization {
  organization: OrganizationSummary;
  reasons: UnauthorizedOrganizationReason[];
}

export interface UnauthorizedOrganizationResponse {
  organization: OrganizationSummary;
  reasons: UnauthorizedOrganizationReasonResponse[];
}

export interface SessionResponse {
  id: string;
  created_at: string;
  expires_at: string;
  authorized_organizations: AuthorizedOrganization[];
  unauthorized_organizations: UnauthorizedOrganizationResponse[];
  token: string;
}
