import { Webhook } from './interfaces/webhook.interface';
import crypto from 'crypto';
import { SignatureVerificationException } from '../common/exceptions';

export class Webhooks {
  constructEvent({
    payload,
    sigHeader,
    secret,
    tolerance = 180,
  }: {
    payload: unknown;
    sigHeader: string;
    secret: string;
    tolerance?: number;
  }): Webhook {
    const options = { payload, sigHeader, secret, tolerance };
    this.verifyHeader(options);

    const webhookPayload = payload as Webhook;
    return webhookPayload;
  }

  private verifyHeader({
    payload,
    sigHeader,
    secret,
    tolerance = 180,
  }: {
    payload: any;
    sigHeader: string;
    secret: string;
    tolerance?: number;
  }): boolean {
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

    const stringPayload = JSON.stringify(payload);
    const expectedSig = this.computeSignature(timestamp, stringPayload, secret);
    if (this.secureCompare(expectedSig, signatureHash) === false) {
      throw new SignatureVerificationException(
        'Signature hash does not match the expected signature hash for payload',
      );
    }

    return true;
  }

  private getTimestampAndSignatureHash(sigHeader: string): string[] {
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

  private computeSignature(
    timestamp: any,
    payload: any,
    secret: string,
  ): string {
    const signedPayload = `${timestamp}.${payload}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest()
      .toString('hex');

    return expectedSignature;
  }

  private secureCompare(stringA: string, stringB: string): boolean {
    const strA = Buffer.from(stringA);
    const strB = Buffer.from(stringB);

    if (strA.length !== strB.length) {
      return false;
    }

    if (crypto.timingSafeEqual) {
      return crypto.timingSafeEqual(strA, strB);
    }

    const len = strA.length;
    let result = 0;

    for (let i = 0; i < len; ++i) {
      // tslint:disable-next-line:no-bitwise
      result |= strA[i] ^ strB[i];
    }
    return result === 0;
  }
}
