interface OrganizationSummary {
  id: string;
  name: string;
}

type AuthenticationMethod =
  | 'GoogleOauth'
  | 'MagicAuth'
  | 'MicrosoftOauth'
  | 'Password';

export type UnauthorizedOrganizationReason = {
  type: 'authentication_method_required';
  allowedAuthenticationMethods: AuthenticationMethod[];
};

export type UnauthorizedOrganizationReasonResponse = {
  type: 'authentication_method_required';
  allowed_authentication_methods: AuthenticationMethod[];
};

export interface UnauthorizedOrganization {
  organization: OrganizationSummary;
  reasons: UnauthorizedOrganizationReason[];
}

export interface UnauthorizedOrganizationResponse {
  organization: OrganizationSummary;
  reasons: UnauthorizedOrganizationReasonResponse[];
}
