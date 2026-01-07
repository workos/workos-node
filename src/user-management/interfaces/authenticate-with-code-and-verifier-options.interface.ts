import {
  AuthenticateWithOptionsBase,
  SerializedAuthenticatePublicClientBase,
} from './authenticate-with-options-base.interface';

export interface AuthenticateWithCodeAndVerifierOptions
  extends AuthenticateWithOptionsBase {
  codeVerifier: string;
  code: string;
  invitationToken?: string;
}

export interface SerializedAuthenticateWithCodeAndVerifierOptions
  extends SerializedAuthenticatePublicClientBase {
  grant_type: 'authorization_code';
  code_verifier: string;
  code: string;
  invitation_token?: string;
}
