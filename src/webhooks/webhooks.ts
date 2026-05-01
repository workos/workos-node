// @oagen-ignore-file
import { deserializeEvent } from '../common/serializers';
import { Event, EventResponse } from '../common/interfaces';
import { SignatureProvider } from '../common/crypto/signature-provider';
import { CryptoProvider } from '../common/crypto/crypto-provider';

// Parse only after verification succeeds — a malformed body never reaches
// JSON.parse on an unauthenticated request.
function parseVerifiedPayload(
  payload: string | Uint8Array | ArrayBuffer | Record<string, unknown>,
): EventResponse {
  if (typeof payload === 'string') {
    return JSON.parse(payload) as EventResponse;
  }
  if (payload instanceof Uint8Array) {
    return JSON.parse(
      new TextDecoder('utf-8').decode(payload),
    ) as EventResponse;
  }
  if (payload instanceof ArrayBuffer) {
    return JSON.parse(
      new TextDecoder('utf-8').decode(new Uint8Array(payload)),
    ) as EventResponse;
  }
  return payload as unknown as EventResponse;
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
    // Prefer raw request bytes (string / Uint8Array / Buffer / ArrayBuffer) so
    // the HMAC is computed over the exact bytes WorkOS signed. Parsed objects
    // are still accepted for back-compat but fall through a JSON.stringify
    // round-trip that can disagree with the on-the-wire bytes.
    payload: string | Uint8Array | ArrayBuffer | Record<string, unknown>;
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
