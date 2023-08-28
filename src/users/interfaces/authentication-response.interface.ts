import { User, UserResponse } from './user.interface';

export interface AuthenticationResponse {
  user: User;
}

export interface AuthenticationResponseResponse {
  user: UserResponse;
}
