export interface AuthenticateWithEmailVerificationOptions {
  clientId: string;
  code: string;
  pendingAuthenticationToken: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticateUserWithEmailVerificationCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateWithEmailVerificationOptions {
  grant_type: 'urn:workos:oauth:grant-type:email-verification:code';
  client_id: string;
  client_secret: string | undefined;
  code: string;
  pending_authentication_token: string;
  ip_address?: string;
  user_agent?: string;
}
