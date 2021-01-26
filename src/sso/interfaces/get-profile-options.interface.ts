export interface CommonGetProfileOptions {
  code: string;
}
export type GetProfileOptions =
  | ({
      clientID: string;
      projectID?: never;
    } & CommonGetProfileOptions)
  | ({
      clientID?: never;
      /**
       * @deprecated The projectID parameter has been deprecated. Please use clientID.
       */
      projectID: string;
    } & CommonGetProfileOptions);
