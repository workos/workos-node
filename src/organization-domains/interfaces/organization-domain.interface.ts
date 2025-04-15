export enum OrganizationDomainState {
  /**
   * @deprecated
   */
  LegacyVerified = 'legacy_verified',
  Verified = 'verified',
  Pending = 'pending',
  Failed = 'failed',
}

export enum OrganizationDomainVerificationStrategy {
  Dns = 'dns',
  Manual = 'manual',
}

export interface OrganizationDomain {
  object: 'organization_domain';
  id: string;
  domain: string;
  organizationId: string;
  state: OrganizationDomainState;
  verificationToken?: string;
  verificationStrategy: OrganizationDomainVerificationStrategy;
}

export interface OrganizationDomainResponse {
  object: 'organization_domain';
  id: string;
  domain: string;
  organization_id: string;
  state: OrganizationDomainState;
  verification_token?: string;
  verification_strategy: OrganizationDomainVerificationStrategy;
}
