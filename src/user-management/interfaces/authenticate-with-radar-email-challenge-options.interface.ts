import {
  AuthenticateWithOptionsBase,
  SerializedAuthenticateWithOptionsBase,
} from './authenticate-with-options-base.interface';

export interface AuthenticateWithRadarEmailChallengeOptions extends AuthenticateWithOptionsBase {
  code: string;
  radarChallengeId: string;
  pendingAuthenticationToken: string;
}

export interface AuthenticateUserWithRadarEmailChallengeCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateWithRadarEmailChallengeOptions extends SerializedAuthenticateWithOptionsBase {
  grant_type: 'urn:workos:oauth:grant-type:radar-email-challenge:code';
  code: string;
  radar_challenge_id: string;
  pending_authentication_token: string;
}
