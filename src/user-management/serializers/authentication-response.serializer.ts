import {
  AuthenticationResponse,
  AuthenticationResponseResponse,
} from '../interfaces';
import { deserializeUser } from './user.serializer';

export const deserializeAuthenticationResponse = (
  authenticationResponse: AuthenticationResponseResponse,
): AuthenticationResponse => ({
  user: deserializeUser(authenticationResponse.user),
});
