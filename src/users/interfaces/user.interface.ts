export type User = ManagedUser | UnmanagedUser;
export type UserResponse = ManagedUserResponse | UnmanagedUserResponse;

interface ManagedUser extends BaseUser {
  userType: 'managed';
  organizationMemberships: [OrganizationMembership];
  ssoProfileId: string | null;
}

interface ManagedUserResponse extends BaseUserResponse {
  user_type: 'managed';
  organization_memberships: [OrganizationMembershipResponse];
  sso_profile_id: string | null;
}
interface UnmanagedUser extends BaseUser {
  userType: 'unmanaged';
  organizationMemberships: OrganizationMembership[];
  emailVerifiedAt: string | null;
  googleOauthProfileId: string | null;
  microsoftOauthProfileId: string | null;
}

interface UnmanagedUserResponse extends BaseUserResponse {
  user_type: 'unmanaged';
  organization_memberships: OrganizationMembershipResponse[];
  email_verified_at: string | null;
  google_oauth_profile_id: string | null;
  microsoft_oauth_profile_id: string | null;
}

export interface BaseUser {
  object: 'user';
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BaseUserResponse {
  object: 'user';
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  organization: OrganizationSummary;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembershipResponse {
  organization: OrganizationSummary;
  created_at: string;
  updated_at: string;
}

interface OrganizationSummary {
  id: string;
  name: string;
}
