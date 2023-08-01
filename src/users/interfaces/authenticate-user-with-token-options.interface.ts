export interface AuthenticateUserWithTokenOptions {
  client_id: string;
  code: string;
  start_session?: boolean;
  expires_in?: number;
}
