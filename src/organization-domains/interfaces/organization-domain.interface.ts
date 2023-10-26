export enum OrganizationDomainState {
  Unverified = 'unverified',
  Verified = 'verified',
  Pending = 'pending',
  Failed = 'failed',
}

export interface OrganizationDomain {
  object: 'organization_domain';
  id: string;
  domain: string;
  state: OrganizationDomainState;
  verificationToken: string;
}

export interface OrganizationDomainResponse {
  object: 'organization_domain';
  id: string;
  domain: string;
  state: OrganizationDomainState;
  verification_token: string;
}
