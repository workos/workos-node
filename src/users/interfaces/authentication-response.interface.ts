import { User, UserResponse } from './user.interface';
import { Session, SessionResponse } from './session.interface';

export interface AuthenticationResponse {
  session?: Session;
  user: User;
}

export interface AuthenticationResponseResponse {
  session?: SessionResponse;
  user: UserResponse;
}
