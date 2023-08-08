export type User = ManagedUser | UnmanagedUser;
export type UserResponse = ManagedUserResponse | UnmanagedUserResponse;

interface ManagedUser extends BaseUser {
  userType: 'managed';
  ssoProfileId: string | null;
}

interface ManagedUserResponse extends BaseUserResponse {
  user_type: 'managed';
  sso_profile_id: string | null;
}
interface UnmanagedUser extends BaseUser {
  userType: 'unmanaged';
  emailVerifiedAt: string | null;
  googleOauthProfileId: string | null;
  microsoftOauthProfileId: string | null;
}

interface UnmanagedUserResponse extends BaseUserResponse {
  user_type: 'unmanaged';
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
