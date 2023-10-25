export enum VerificationState {
  Unverified = 'unverified',
  Verified = 'verified',
  Pending = 'pending',
  Failed = 'failed',
}

export interface OrganizationDomain {
  object: 'organization_domain';
  id: string;
  domain: string;
  state: VerificationState;
  verificationToken: string;
}

export interface OrganizationDomainResponse {
  object: 'organization_domain';
  id: string;
  domain: string;
  state: VerificationState;
  verification_token: string;
}
