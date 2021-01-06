export interface AuthorizationURLOptions {
  domain?: string;
  projectID?: string;
  clientID?: string;
  provider?: string;
  redirectURI: string;
  state?: string;
}
