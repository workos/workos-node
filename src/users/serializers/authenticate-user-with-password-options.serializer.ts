import {
  AuthenticateUserWithPasswordOptions,
  SerializedAuthenticateUserWithPasswordOptions,
} from '../interfaces';

export const serializeAuthenticateUserWithPasswordOptions = (
  options: AuthenticateUserWithPasswordOptions,
): SerializedAuthenticateUserWithPasswordOptions => ({
  email: options.email,
  password: options.password,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
  start_session: options.startSession,
  expires_in: options.expiresIn,
});
