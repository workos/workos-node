export interface AuthorizeLogoutOptions {
  profileId: string;
}

export interface SerializedAuthorizeLogoutOptions {
  profile_id: string;
}

export interface AuthorizeLogoutResponse {
  logout_token: string;
  logout_url: string;
}

export interface AuthorizeLogout {
  logoutToken: string;
  logoutUrl: string;
}
