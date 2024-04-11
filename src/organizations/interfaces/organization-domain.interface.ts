export interface OrganizationDomain {
  object: 'organization_domain';
  id: string;
  domain: string;
  verification_token?: string;
  verification_stragegy?: 'dns' | 'manual';
  state?: 'failed' | 'pending' | 'legacy_verified' | 'verified';
}
