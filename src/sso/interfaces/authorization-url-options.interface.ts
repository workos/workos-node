export interface AuthorizationURLOptions {
  client_id: string;
  connection?: string;
  organization?: string;

  /**
   * @deprecated Please use `organization` instead.
   */
  domain?: string;
  domain_hint?: string;
  login_hint?: string;
  provider?: string;
  redirect_uri: string;
  state?: string;
}
