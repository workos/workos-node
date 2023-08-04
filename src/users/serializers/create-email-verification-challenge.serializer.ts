import {
  CreateEmailVerificationChallengeResponse,
  CreateEmailVerificationChallengeResponseResponse,
} from '../interfaces';
import { deserializeUser } from './user.serializer';

export const deserializeCreateEmailVerificationChallengeResponse = (
  createEmailVerificationChallengeResponse: CreateEmailVerificationChallengeResponseResponse,
): CreateEmailVerificationChallengeResponse => ({
  token: createEmailVerificationChallengeResponse.token,
  user: deserializeUser(createEmailVerificationChallengeResponse.user),
});
