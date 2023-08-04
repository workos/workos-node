import { User, UserResponse } from './user.interface';
import { Session, SessionResponse } from './session.interface';

export interface VerifySessionOptions {
  token: string;
  clientId: string;
}

export interface SerializedVerifySessionOptions {
  token: string;
  client_id: string;
}

export interface VerifySessionResponse {
  session: Session;
  user: User;
}

export interface VerifySessionResponseResponse {
  session: SessionResponse;
  user: UserResponse;
}
