import { User, UserResponse } from './user.interface';

export interface AuthenticationResponse {
  user: User;
  organizationId?: string;
}

export interface AuthenticationResponseResponse {
  user: UserResponse;
  organization_id?: string;
}
