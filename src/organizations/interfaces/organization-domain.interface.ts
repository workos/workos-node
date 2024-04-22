export interface OrganizationDomain {
  object: 'organization_domain';
  id: string;
  domain: string;
  verification_token?: string;
  verification_strategy?: string;
  state?: string;
}
