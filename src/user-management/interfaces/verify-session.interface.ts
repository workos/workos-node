import { User } from './user.interface';
import { Session } from './session.interface';

export interface VerifySessionOptions {
  token: string;
  client_id: string;
}

export interface VerifySessionResponse {
  session: Session;
  user: User;
}
