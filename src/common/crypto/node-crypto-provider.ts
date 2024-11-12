import * as crypto from 'node:crypto';
import { CryptoProvider } from './crypto-provider';

/**
 * `CryptoProvider which uses the Node `crypto` package for its computations.
 */
export class NodeCryptoProvider extends CryptoProvider {
  /** @override */
  computeHMACSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
  }

  /** @override */
  async computeHMACSignatureAsync(
    payload: string,
    secret: string,
  ): Promise<string> {
    const signature = await this.computeHMACSignature(payload, secret);
    return signature;
  }

  /** @override */
  async secureCompare(stringA: string, stringB: string): Promise<boolean> {
    const bufferA = this.encoder.encode(stringA);
    const bufferB = this.encoder.encode(stringB);

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    // Generate a random key for HMAC
    const key = crypto.randomBytes(32); // Generates a 256-bit key
    const hmacA = crypto.createHmac('sha256', key).update(bufferA).digest();
    const hmacB = crypto.createHmac('sha256', key).update(bufferB).digest();

    // Perform a constant time comparison
    return crypto.timingSafeEqual(hmacA, hmacB);
  }
}
