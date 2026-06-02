import {
  AuthenticateWithOptionsBase,
  SerializedAuthenticateWithOptionsBase,
} from './authenticate-with-options-base.interface';

export interface AuthenticateWithRadarSmsChallengeOptions extends AuthenticateWithOptionsBase {
  code: string;
  verificationId: string;
  phoneNumber: string;
  pendingAuthenticationToken: string;
}

export interface AuthenticateUserWithRadarSmsChallengeCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateWithRadarSmsChallengeOptions extends SerializedAuthenticateWithOptionsBase {
  grant_type: 'urn:workos:oauth:grant-type:radar-sms-challenge:code';
  code: string;
  verification_id: string;
  phone_number: string;
  pending_authentication_token: string;
}
