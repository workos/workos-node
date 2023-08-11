import {
  AuthenticationResponse,
  AuthenticationResponseResponse,
} from '../interfaces';
import { deserializeSession } from './session.serializer';
import { deserializeUser } from './user.serializer';

export const deserializeAuthenticationResponse = (
  authenticationResponse: AuthenticationResponseResponse,
): AuthenticationResponse => ({
  session: deserializeSession(authenticationResponse.session),
  user: deserializeUser(authenticationResponse.user),
});
