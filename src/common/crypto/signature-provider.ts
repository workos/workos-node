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
    // Accepts raw request bytes (string/Uint8Array/Buffer) — preferred — or a
    // parsed object for back-compat. Raw-bytes path HMACs the exact bytes the
    // server signed; object path falls back to JSON.stringify (unsafe to
    // mutation that round-trips through JSON.parse → JSON.stringify).
    payload:
      | string
      | Uint8Array
      | ArrayBuffer
      | Record<string, unknown>
      | unknown;
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
    payload:
      | string
      | Uint8Array
      | ArrayBuffer
      | Record<string, unknown>
      | unknown,
    secret: string,
  ): Promise<string> {
    const signable = toSignableString(payload);
    const signedPayload = `${timestamp}.${signable}`;

    return await this.cryptoProvider.computeHMACSignatureAsync(
      signedPayload,
      secret,
    );
  }
}

// Raw bytes path (string / Uint8Array / ArrayBuffer) reproduces the exact
// bytes WorkOS signed on emit. Object path is legacy back-compat — vulnerable
// to any on-the-wire mutation that round-trips through JSON.parse →
// JSON.stringify to the same canonical form (whitespace, key order, \uXXXX
// escapes, duplicate keys).
function toSignableString(
  payload:
    | string
    | Uint8Array
    | ArrayBuffer
    | Record<string, unknown>
    | unknown,
): string {
  if (typeof payload === 'string') {
    return payload;
  }
  if (payload instanceof Uint8Array) {
    return new TextDecoder('utf-8').decode(payload);
  }
  if (payload instanceof ArrayBuffer) {
    return new TextDecoder('utf-8').decode(new Uint8Array(payload));
  }
  return JSON.stringify(payload);
}
