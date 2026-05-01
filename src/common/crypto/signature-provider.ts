// @oagen-ignore-file
import { SignatureVerificationException } from '../exceptions';
import { CryptoProvider } from './crypto-provider';

export class SignatureProvider {
  private cryptoProvider: CryptoProvider;

  constructor(cryptoProvider: CryptoProvider) {
    this.cryptoProvider = cryptoProvider;
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

    // WorkOS emits microsecond timestamps; convert to milliseconds for comparison
    const timestampMs = Math.floor(parseInt(timestamp, 10) / 1000);
    const now = Date.now();

    if (timestampMs < now - tolerance) {
      throw new SignatureVerificationException(
        'Timestamp outside the tolerance zone',
      );
    }

    if (timestampMs > now + tolerance) {
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
