import { SignatureVerificationException } from '../common/exceptions';
import { deserializeEvent } from '../common/serializers';
import { Event, EventResponse } from '../common/interfaces';

export class Webhooks {
  private encoder = new TextEncoder();

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
    if ((await this.secureCompare(expectedSig, signatureHash)) === false) {
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

    const key = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      this.encoder.encode(signedPayload),
    );

    // crypto.subtle returns the signature in base64 format. This must be
    // encoded in hex to match the CryptoProvider contract. We map each byte in
    // the buffer to its corresponding hex octet and then combine into a string.
    const signatureBytes = new Uint8Array(signatureBuffer);
    const signatureHexCodes = new Array(signatureBytes.length);

    for (let i = 0; i < signatureBytes.length; i++) {
      signatureHexCodes[i] = byteHexMapping[signatureBytes[i]];
    }

    return signatureHexCodes.join('');
  }

  async secureCompare(stringA: string, stringB: string): Promise<boolean> {
    const bufferA = this.encoder.encode(stringA);
    const bufferB = this.encoder.encode(stringB);

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    const algorithm = { name: 'HMAC', hash: 'SHA-256' };
    const key = (await crypto.subtle.generateKey(algorithm, false, [
      'sign',
      'verify',
    ])) as CryptoKey;
    const hmac = await crypto.subtle.sign(algorithm, key, bufferA);
    const equal = await crypto.subtle.verify(algorithm, key, hmac, bufferB);

    return equal;
  }
}

// Cached mapping of byte to hex representation. We do this once to avoid re-
// computing every time we need to convert the result of a signature to hex.
const byteHexMapping = new Array(256);
for (let i = 0; i < byteHexMapping.length; i++) {
  byteHexMapping[i] = i.toString(16).padStart(2, '0');
}
