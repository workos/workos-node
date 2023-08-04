import {
  AuthenticationResponse,
  AuthenticationResponseResponse,
} from '../interfaces';
import { deserializeSession } from './session.serializer';
import { deserializeUser } from './user.serializer';

export const deserializeAuthenticationResponse = (
  authenticationResponse: AuthenticationResponseResponse,
): AuthenticationResponse => ({
  session: authenticationResponse.session
    ? deserializeSession(authenticationResponse.session)
    : undefined,
  user: deserializeUser(authenticationResponse.user),
});
