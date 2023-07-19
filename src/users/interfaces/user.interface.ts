export type User = ManagedUser | UnmanangedUser;

interface ManagedUser extends BaseUser {
  user_type: 'managed';
  organization_memberships: [OrganizationMembership];
  sso_profile_id: string;
}

interface UnmanangedUser extends BaseUser {
  user_type: 'unmanaged';
  organization_memberships: OrganizationMembership[];
  email_verified_at?: string;
  google_oauth_profile_id?: string;
}

interface BaseUser {
  object: 'user';
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationMembership {
  organization: OrganizationSummary;
  created_at: string;
  updated_at: string;
}

interface OrganizationSummary {
  id: string;
  name: string;
}
