import type {
  ConnectApplication,
  ConnectApplicationResponse,
} from '../../connect/interfaces';

export interface AuthorizedConnectApplication {
  object: 'authorized_connect_application';
  id: string;
  grantedScopes: string[];
  oauthResource?: string;
  application: ConnectApplication;
}

export interface AuthorizedConnectApplicationResponse {
  object: 'authorized_connect_application';
  id: string;
  granted_scopes: string[];
  oauth_resource?: string;
  application: ConnectApplicationResponse;
}
