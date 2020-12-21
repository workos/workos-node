export interface AuthorizationURLOptions {
  domain?: string;
  projectID?: string | undefined;
  clientID?: string | undefined;
  provider?: string;
  redirectURI: string;
  state?: string;
}
