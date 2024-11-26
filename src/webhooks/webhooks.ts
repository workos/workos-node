import { deserializeEvent } from '../common/serializers';
import { Event, EventResponse } from '../common/interfaces';
import { SignatureProvider } from '../common/crypto/SignatureProvider';
import { CryptoProvider } from '../common/crypto/crypto-provider';

export class Webhooks {
  private signatureProvider: SignatureProvider;

  constructor(cryptoProvider: CryptoProvider) {
    this.signatureProvider = new SignatureProvider(cryptoProvider);
  }

  get verifyHeader() {
    return this.signatureProvider.verifyHeader.bind(this.signatureProvider);
  }

  get computeSignature() {
    return this.signatureProvider.computeSignature.bind(this.signatureProvider);
  }

  get getTimestampAndSignatureHash() {
    return this.signatureProvider.getTimestampAndSignatureHash.bind(
      this.signatureProvider,
    );
  }

  async constructEvent({
    payload,
    sigHeader,
    secret,
    tolerance = 180000,
  }: {
    payload: unknown;
    sigHeader: string;
    secret: string;
    tolerance?: number;
  }): Promise<Event> {
    const options = { payload, sigHeader, secret, tolerance };
    await this.verifyHeader(options);

    const webhookPayload = payload as EventResponse;

    return deserializeEvent(webhookPayload);
  }
}
