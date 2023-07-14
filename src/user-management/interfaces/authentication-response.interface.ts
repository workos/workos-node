import { User } from './user.interface';
import { Session } from './session.interface';

export interface AuthenticationResponse {
  session?: Session;
  user: User;
}
