// TODO
// - should User be defined as `ManagedUser | UnmanagedUser` ?

export interface User {
  object: 'user';
  id: string;
  user_type: 'managed' | 'unmanaged';
  email: string;
  first_name?: string;
  last_name?: string;
  email_verified_at?: string;
  sso_profile_id?: string;
  identities: Identity[];
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
