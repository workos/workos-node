import { User } from './user.interface';

export interface ChallengeResponse {
  token: string;
  user: User;
}
