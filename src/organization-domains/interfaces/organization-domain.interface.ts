export enum OrganizationDomainState {
  LegacyVerified = 'legacy_verified',
  Verified = 'verified',
  Pending = 'pending',
  Failed = 'failed',
}

export enum OrganizationDomainVerificationStrategy {
  Dns = 'dns',
  Developer = 'developer',
}

export interface OrganizationDomain {
  object: 'organization_domain';
  id: string;
  domain: string;
  state: OrganizationDomainState;
  verificationToken: string;
  verificationStrategy: OrganizationDomainVerificationStrategy;
}

export interface OrganizationDomainResponse {
  object: 'organization_domain';
  id: string;
  domain: string;
  state: OrganizationDomainState;
  verification_token: string;
  verification_strategy: OrganizationDomainVerificationStrategy;
}
