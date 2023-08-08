import { UnexpectedUserTypeException } from '../exceptions';
import { BaseUser, User, UserResponse } from '../interfaces';

export const deserializeUser = (user: UserResponse): User => {
  const baseUser: BaseUser = {
    object: user.object,
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };

  switch (user.user_type) {
    case 'managed':
      return {
        ...baseUser,
        userType: user.user_type,
        ssoProfileId: user.sso_profile_id,
      };
    case 'unmanaged':
      return {
        ...baseUser,
        userType: user.user_type,
        emailVerifiedAt: user.email_verified_at,
        googleOauthProfileId: user.google_oauth_profile_id,
        microsoftOauthProfileId: user.microsoft_oauth_profile_id,
      };
    default:
      throw new UnexpectedUserTypeException(user);
  }
};
