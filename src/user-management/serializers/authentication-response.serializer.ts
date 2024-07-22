import {
  AuthenticationResponse,
  AuthenticationResponseResponse,
} from '../interfaces';
import { deserializeUser } from './user.serializer';

export const deserializeAuthenticationResponse = (
  authenticationResponse: AuthenticationResponseResponse,
): AuthenticationResponse => {
  const {
    user,
    organization_id,
    access_token,
    refresh_token,
    authentication_method,
    impersonator,
    ...rest
  } = authenticationResponse;

  return {
    user: deserializeUser(user),
    organizationId: organization_id,
    accessToken: access_token,
    refreshToken: refresh_token,
    impersonator,
    authenticationMethod: authentication_method,
    ...rest,
  };
};
