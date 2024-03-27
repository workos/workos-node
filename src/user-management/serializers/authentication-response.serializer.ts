import {
  AuthenticationResponse,
  AuthenticationResponseResponse,
  RefreshAuthenticationResponse,
  RefreshAuthenticationResponseResponse,
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
    impersonator,
    ...rest
  } = authenticationResponse;

  return {
    user: deserializeUser(user),
    organizationId: organization_id,
    accessToken: access_token,
    refreshToken: refresh_token,
    impersonator,
    ...rest,
  };
};

export const deserializeRefreshAuthenticationResponse = (
  refreshAuthenticationResponse: RefreshAuthenticationResponseResponse,
): RefreshAuthenticationResponse => {
  const { access_token, refresh_token, ...rest } =
    refreshAuthenticationResponse;

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    ...rest,
  };
};
