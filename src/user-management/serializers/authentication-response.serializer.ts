import {
  AuthenticationResponse,
  AuthenticationResponseResponse,
} from '../interfaces';
import { deserializeUser } from './user.serializer';

export const deserializeAuthenticationResponse = (
  authenticationResponse: AuthenticationResponseResponse,
): AuthenticationResponse => {
  const { user, organization_id, ...rest } = authenticationResponse;
  return {
    user: deserializeUser(user),
    organizationId: organization_id,
    ...rest,
  };
};
