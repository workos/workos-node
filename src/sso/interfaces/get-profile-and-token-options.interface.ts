export interface CommonGetProfileAndTokenOptions {
  code: string;
}

export type GetProfileAndTokenOptions =
  | ({
      clientID: string;
      projectID?: never;
    } & CommonGetProfileAndTokenOptions)
  | ({
      clientID?: never;
      /**
       * @deprecated The projectID parameter has been deprecated. Please use clientID.
       */
      projectID: string;
    } & CommonGetProfileAndTokenOptions);
