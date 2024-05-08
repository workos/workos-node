import { SignatureVerificationException } from '../common/exceptions';
import { deserializeEvent } from '../common/serializers';
import { Event, EventResponse } from '../common/interfaces';
import {
  CryptoProvider,
  SubtleCryptoProvider,
  NodeCryptoProvider,
} from '../common/crypto';

export class Webhooks {
  private cryptoProvider: CryptoProvider;

  constructor(subtleCrypto?: typeof crypto.subtle) {
    if (typeof crypto.subtle !== 'undefined') {
      this.cryptoProvider = new SubtleCryptoProvider(subtleCrypto);
    } else {
      this.cryptoProvider = new NodeCryptoProvider();
    }
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

  async verifyHeader({
    payload,
    sigHeader,
    secret,
    tolerance = 180000,
  }: {
    payload: any;
    sigHeader: string;
    secret: string;
    tolerance?: number;
  }): Promise<boolean> {
    const [timestamp, signatureHash] =
      this.getTimestampAndSignatureHash(sigHeader);

    if (!signatureHash || Object.keys(signatureHash).length === 0) {
      throw new SignatureVerificationException(
        'No signature hash found with expected scheme v1',
      );
    }

    if (parseInt(timestamp, 10) < Date.now() - tolerance) {
      throw new SignatureVerificationException(
        'Timestamp outside the tolerance zone',
      );
    }

    const expectedSig = await this.computeSignature(timestamp, payload, secret);
    if (
      (await this.cryptoProvider.secureCompare(expectedSig, signatureHash)) ===
      false
    ) {
      throw new SignatureVerificationException(
        'Signature hash does not match the expected signature hash for payload',
      );
    }
    return true;
  }

  getTimestampAndSignatureHash(sigHeader: string): [string, string] {
    const signature = sigHeader;
    const [t, v1] = signature.split(',');
    if (typeof t === 'undefined' || typeof v1 === 'undefined') {
      throw new SignatureVerificationException(
        'Signature or timestamp missing',
      );
    }
    const { 1: timestamp } = t.split('=');
    const { 1: signatureHash } = v1.split('=');

    return [timestamp, signatureHash];
  }

  async computeSignature(
    timestamp: any,
    payload: any,
    secret: string,
  ): Promise<string> {
    payload = JSON.stringify(payload);
    const signedPayload = `${timestamp}.${payload}`;

    return await this.cryptoProvider.computeHMACSignatureAsync(
      signedPayload,
      secret,
    );
  }
}
