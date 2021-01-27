export interface CommonAuthorizationURLOptions {
  domain?: string;
  provider?: string;
  redirectURI: string;
  state?: string;
}
export type AuthorizationURLOptions =
  | ({
      clientID: string;
      projectID?: never;
    } & CommonAuthorizationURLOptions)
  | ({
      clientID?: never;
      /**
       * @deprecated The projectID parameter has been deprecated. Please use clientID.
       */
      projectID: string;
    } & CommonAuthorizationURLOptions);
