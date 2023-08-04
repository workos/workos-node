import {
  SerializedVerifySessionOptions,
  VerifySessionOptions,
  VerifySessionResponse,
  VerifySessionResponseResponse,
} from '../interfaces';
import { deserializeSession } from './session.serializer';
import { deserializeUser } from './user.serializer';

export const deserializeVerifySessionResponse = (
  verifySessionResponse: VerifySessionResponseResponse,
): VerifySessionResponse => ({
  session: deserializeSession(verifySessionResponse.session),
  user: deserializeUser(verifySessionResponse.user),
});

export const serializeVerifySessionOptions = (
  options: VerifySessionOptions,
): SerializedVerifySessionOptions => ({
  token: options.token,
  client_id: options.clientId,
});
