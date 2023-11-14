export interface User {
  object: 'user';
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  object: 'user';
  id: string;
  email: string;
  email_verified: boolean;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}
