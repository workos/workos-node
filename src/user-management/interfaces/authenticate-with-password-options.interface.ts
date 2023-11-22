import {
  AuthenticateWithOptionsBase,
  SerializedAuthenticateWithOptionsBase,
} from './authenticate-with-options-base.interface';

export interface AuthenticateWithPasswordOptions
  extends AuthenticateWithOptionsBase {
  email: string;
  password: string;
}

export interface AuthenticateUserWithPasswordCredentials {
  clientSecret: string | undefined;
}

export interface SerializedAuthenticateWithPasswordOptions
  extends SerializedAuthenticateWithOptionsBase {
  grant_type: 'password';
  email: string;
  password: string;
}
