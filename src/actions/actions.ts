import { SignatureProvider } from '../common/crypto';
import { CryptoProvider } from '../common/crypto/crypto-provider';
import { unreachable } from '../common/utils/unreachable';
import {
  ActionPayload,
  AuthenticationActionPayload,
  UserRegistrationActionPayload,
} from './interfaces/action-payload';
import {
  AuthenticationActionResponseData,
  ResponsePayload,
  UserRegistrationActionResponseData,
} from './interfaces/response-payload';

export class Actions {
  private signatureProvider: SignatureProvider;

  constructor(cryptoProvider: CryptoProvider) {
    this.signatureProvider = new SignatureProvider(cryptoProvider);
  }

  private get computeSignature() {
    return this.signatureProvider.computeSignature.bind(this.signatureProvider);
  }

  get verifyHeader() {
    return this.signatureProvider.verifyHeader.bind(this.signatureProvider);
  }

  serializeType(
    type:
      | AuthenticationActionResponseData['type']
      | UserRegistrationActionResponseData['type'],
  ) {
    switch (type) {
      case 'authentication':
        return 'authentication_action_response';
      case 'user_registration':
        return 'user_registration_action_response';
      default:
        return unreachable(type);
    }
  }

  async signResponse(
    data: AuthenticationActionResponseData | UserRegistrationActionResponseData,
    secret: string,
  ) {
    let errorMessage: string | undefined;
    const { verdict, type } = data;

    if (verdict === 'Deny' && data.errorMessage) {
      errorMessage = data.errorMessage;
    }

    const responsePayload: ResponsePayload = {
      timestamp: Date.now(),
      verdict,
      ...(verdict === 'Deny' &&
        data.errorMessage && { error_message: errorMessage }),
    };

    const response = {
      object: this.serializeType(type),
      payload: responsePayload,
      signature: await this.computeSignature(
        responsePayload.timestamp,
        responsePayload,
        secret,
      ),
    };

    return response;
  }

  async deserialize({
    payload,
    sigHeader,
    secret,
    type,
  }: {
    payload: ActionPayload;
    sigHeader: string;
    secret: string;
    type: 'authentication';
  }): Promise<AuthenticationActionPayload>;

  async deserialize({
    payload,
    sigHeader,
    secret,
    type,
  }: {
    payload: ActionPayload;
    sigHeader: string;
    secret: string;
    type: 'user_registration';
  }): Promise<UserRegistrationActionPayload>;

  async deserialize({
    payload,
    sigHeader,
    secret,
    type,
  }: {
    payload: ActionPayload;
    sigHeader: string;
    secret: string;
    type: 'authentication' | 'user_registration';
  }) {
    await this.verifyHeader({ payload, sigHeader, secret });

    switch (type) {
      case 'authentication':
        return payload as AuthenticationActionPayload;
      case 'user_registration':
        return payload as UserRegistrationActionPayload;
      default:
        return unreachable(type);
    }
  }
}
