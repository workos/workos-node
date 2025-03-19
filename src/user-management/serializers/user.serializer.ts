import { User, UserResponse } from '../interfaces';

export const deserializeUser = (user: UserResponse): User => ({
  object: user.object,
  id: user.id,
  email: user.email,
  emailVerified: user.email_verified,
  firstName: user.first_name,
  profilePictureUrl: user.profile_picture_url,
  lastName: user.last_name,
  lastSignInAt: user.last_sign_in_at,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
  externalId: user.external_id ?? null,
  metadata: user.metadata ?? {},
});
