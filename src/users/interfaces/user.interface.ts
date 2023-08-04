export type User = ManagedUser | UnmanagedUser;

interface ManagedUser extends BaseUser {
  user_type: 'managed';
  organization_memberships: [OrganizationMembership];
  sso_profile_id: string | null;
}

interface UnmanagedUser extends BaseUser {
  user_type: 'unmanaged';
  organization_memberships: OrganizationMembership[];
  email_verified_at: string | null;
  google_oauth_profile_id: string | null;
  microsoft_oauth_profile_id: string | null;
}

interface BaseUser {
  object: 'user';
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
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
