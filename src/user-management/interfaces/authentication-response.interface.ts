import { Impersonator, ImpersonatorResponse } from './impersonator.interface';
import { OauthTokens, OauthTokensResponse } from './oauth-tokens.interface';
import { User, UserResponse } from './user.interface';

type AuthenticationMethod =
  | 'SSO'
  | 'Password'
  | 'Passkey'
  | 'AppleOAuth'
  | 'BitbucketOAuth'
  | 'DiscordOAuth'
  | 'GitHubOAuth'
  | 'GitLabOAuth'
  | 'GoogleOAuth'
  | 'IntuitOAuth'
  | 'LinkedInOAuth'
  | 'MicrosoftOAuth'
  | 'SalesforceOAuth'
  | 'SlackOAuth'
  | 'VercelMarketplaceOAuth'
  | 'VercelOAuth'
  | 'XeroOAuth'
  | 'MagicAuth'
  | 'CrossAppAuth'
  | 'ExternalAuth'
  | 'MigratedSession'
  | 'Impersonation';

export interface AuthenticationResponse {
  user: User;
  organizationId?: string;
  accessToken: string;
  refreshToken: string;
  impersonator?: Impersonator;
  authenticationMethod?: AuthenticationMethod;
  sealedSession?: string;
  oauthTokens?: OauthTokens;
}

export interface AuthenticationResponseResponse {
  user: UserResponse;
  organization_id?: string;
  access_token: string;
  refresh_token: string;
  impersonator?: ImpersonatorResponse;
  authentication_method?: AuthenticationMethod;
  oauth_tokens?: OauthTokensResponse;
}
