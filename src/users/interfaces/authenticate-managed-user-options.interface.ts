export interface AuthenticateManagedUserOptions {
  client_id: string;
  client_secret: string;
  grant_type: 'authorization_code';
  code: string;
  start_session?: boolean;
  expires_in?: number;
}
