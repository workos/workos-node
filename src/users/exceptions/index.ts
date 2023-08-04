import { UserResponse } from '../interfaces';

export class UnexpectedUserTypeException extends Error {
  constructor(user: UserResponse) {
    super();
    this.message = `Unsupported user type: ${user.user_type} received from API.`;
  }
}
