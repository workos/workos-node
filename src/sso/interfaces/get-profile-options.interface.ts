export interface GetProfileOptions {
  clientID: string;
  code: string;
  /**
   * @deprecated The projectID parameter has been deprecated. Please use clientID.
   */
  projectID?: string;
}
