import { User, UserResponse } from '../interfaces';

export const deserializeUser = (user: UserResponse): User => ({
  object: user.object,
  id: user.id,
  email: user.email,
  emailVerifiedAt: user.email_verified_at,
  firstName: user.first_name,
  lastName: user.last_name,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});
