// @oagen-ignore-file
import { deserializeEvent } from '../common/serializers';
import { Event, EventResponse } from '../common/interfaces';
import { SignatureProvider } from '../common/crypto/signature-provider';
import { CryptoProvider } from '../common/crypto/crypto-provider';
import {
  type WebhookPayload,
  decodePayloadToString,
} from '../common/crypto/decode-payload';

// Parse only after verification succeeds — a malformed body never reaches
// JSON.parse on an unauthenticated request.
function parseVerifiedPayload(payload: WebhookPayload): EventResponse {
  if (
    typeof payload === 'object' &&
    !(payload instanceof Uint8Array) &&
    !(payload instanceof ArrayBuffer)
  ) {
    return payload as unknown as EventResponse;
  }
  return JSON.parse(decodePayloadToString(payload)) as EventResponse;
}

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
    payload: WebhookPayload;
    sigHeader: string;
    secret: string;
    tolerance?: number;
  }): Promise<Event> {
    const options = { payload, sigHeader, secret, tolerance };
    await this.verifyHeader(options);

    const webhookPayload = parseVerifiedPayload(payload);

    return deserializeEvent(webhookPayload);
  }
}
