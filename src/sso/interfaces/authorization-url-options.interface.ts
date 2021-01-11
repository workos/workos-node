export interface AuthorizationURLOptions {
  clientID: string;
  domain?: string;
  /**
   * @deprecated The projectID parameter has been deprecated. Please use clientID.
   */
  projectID?: string;
  provider?: string;
  redirectURI: string;
  state?: string;
}
