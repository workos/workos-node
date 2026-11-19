import {
  AuthorizeLogout,
  AuthorizeLogoutOptions,
  AuthorizeLogoutResponse,
  SerializedAuthorizeLogoutOptions,
} from '../interfaces';

export const serializeAuthorizeLogoutOptions = (
  options: AuthorizeLogoutOptions,
): SerializedAuthorizeLogoutOptions => ({
  profile_id: options.profileId,
});

export const deserializeAuthorizeLogout = (
  response: AuthorizeLogoutResponse,
): AuthorizeLogout => ({
  logoutToken: response.logout_token,
  logoutUrl: response.logout_url,
});
