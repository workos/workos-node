import {
  CreatePasswordResetChallengeOptions,
  CreatePasswordResetChallengeResponse,
  CreatePasswordResetChallengeResponseResponse,
  SerializedCreatePasswordResetChallengeOptions,
} from '../interfaces';
import { deserializeUser } from './user.serializer';

export const deserializeCreatePasswordResetChallengeResponse = (
  createPasswordResetChallengeResponse: CreatePasswordResetChallengeResponseResponse,
): CreatePasswordResetChallengeResponse => ({
  token: createPasswordResetChallengeResponse.token,
  user: deserializeUser(createPasswordResetChallengeResponse.user),
});

export const serializeCreatePasswordResetChallengeOptions = (
  options: CreatePasswordResetChallengeOptions,
): SerializedCreatePasswordResetChallengeOptions => ({
  email: options.email,
  password_reset_url: options.passwordResetUrl,
});
