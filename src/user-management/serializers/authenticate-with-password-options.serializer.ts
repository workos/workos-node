import {
  AuthenticateUserWithPasswordCredentials,
  AuthenticateWithPasswordOptions,
  SerializedAuthenticateWithPasswordOptions,
} from '../interfaces';

export const serializeAuthenticateWithPasswordOptions = (
  options: AuthenticateWithPasswordOptions &
    AuthenticateUserWithPasswordCredentials,
): SerializedAuthenticateWithPasswordOptions => ({
  grant_type: 'password',
  client_id: options.clientId,
  client_secret: options.clientSecret,
  email: options.email,
  password: options.password,
  invitation_token: options.invitationToken,
  ip_address: options.ipAddress,
  user_agent: options.userAgent,
});
