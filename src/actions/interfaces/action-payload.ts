interface User {
  object: 'user';
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  email_verified: boolean;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

interface OrganizationDomain {
  object: 'organization_domain';
  id: string;
  organization_id: string;
  domain: string;
  state?: 'failed' | 'legacy_verified' | 'pending' | 'unverified' | 'verified';
  verification_token?: string;
  verification_strategy?: 'dns' | 'manual';
}

interface Organization {
  object: 'organization';
  id: string;
  name: string;
  allow_profiles_outside_organization: boolean;
  stripe_customer_id?: string;
  domains: OrganizationDomain[];
  lookup_key?: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationMembership {
  object: 'organization_membership';
  id: string;
  user_id: string;
  organization_id: string;
  role: {
    slug: string;
  };
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

interface ActionPayloadCommon {
  ip_address?: string;
  user_agent?: string;
}

interface Invite {
  object: 'invitation';
  id: string;
  email: string;
  inviter_user_id?: string;
  organization_id?: string;
  accepted_at: string | null;
  revoked_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserRegistrationActionPayload extends ActionPayloadCommon {
  object: 'user_registration_action_context';
  invitation?: Invite;
  user_data: {
    object: 'user_data';
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface AuthenticationActionPayload extends ActionPayloadCommon {
  object: 'authentication_action_context';
  user: User;
  organization?: Organization;
  organization_membership?: OrganizationMembership;
  issuer?: string;
}

export type ActionPayload =
  | AuthenticationActionPayload
  | UserRegistrationActionPayload;
