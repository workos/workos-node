export interface User {
  object: 'user';
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  object: 'user';
  id: string;
  email: string;
  email_verified_at: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}
