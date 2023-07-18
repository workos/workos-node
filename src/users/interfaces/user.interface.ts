export type User = ManagedUser | UnmanangedUser;

interface ManagedUser extends BaseUser {
  user_type: 'managed';
  identities: [Identity];
  sso_profile_id: string;
}

interface UnmanangedUser extends BaseUser {
  user_type: 'unmanaged';
  identities: Identity[];
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

interface Identity {
  organization: OrganizationSummary;
  created_at: string;
  updated_at: string;
}

interface OrganizationSummary {
  id: string;
  name: string;
}
