import {
  OrganizationDomain,
  OrganizationDomainResponse,
} from '../../organization-domains/interfaces/organization-domain.interface';

export interface Organization {
  /** Distinguishes the Organization object. */
  object: 'organization';
  /** Unique identifier of the Organization. */
  id: string;
  /** A descriptive name for the Organization. This field does not need to be unique. */
  name: string;
  /**
   * Whether the Organization allows profiles outside of its managed domains.
   * @deprecated
   */
  allowProfilesOutsideOrganization: boolean;
  /** List of Organization Domains. */
  domains: OrganizationDomain[];
  /** The Stripe customer ID of the Organization. */
  stripeCustomerId?: string;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
  /** The external ID of the Organization. */
  externalId: string | null;
  /** Object containing [metadata](https://workos.com/docs/authkit/metadata) key/value pairs associated with the Organization. */
  metadata: Record<string, string>;
}

export interface OrganizationResponse {
  object: 'organization';
  id: string;
  name: string;
  allow_profiles_outside_organization: boolean;
  domains: OrganizationDomainResponse[];
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  external_id?: string | null;
  metadata?: Record<string, string>;
}
