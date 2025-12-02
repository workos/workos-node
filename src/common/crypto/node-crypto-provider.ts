import * as crypto from 'crypto';
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
    const signature = this.computeHMACSignature(payload, secret);
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

  async encrypt(
    plaintext: Uint8Array,
    key: Uint8Array,
    iv?: Uint8Array,
    aad?: Uint8Array,
  ): Promise<{
    ciphertext: Uint8Array;
    iv: Uint8Array;
    tag: Uint8Array;
  }> {
    const actualIv = iv || crypto.randomBytes(32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, actualIv);

    if (aad) {
      cipher.setAAD(Buffer.from(aad));
    }

    const ciphertext = Buffer.concat([
      cipher.update(Buffer.from(plaintext)),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return {
      ciphertext: new Uint8Array(ciphertext),
      iv: new Uint8Array(actualIv),
      tag: new Uint8Array(tag),
    };
  }

  async decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array,
    tag: Uint8Array,
    aad?: Uint8Array,
  ): Promise<Uint8Array> {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(Buffer.from(tag));

    if (aad) {
      decipher.setAAD(Buffer.from(aad));
    }

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertext)),
      decipher.final(),
    ]);

    return new Uint8Array(decrypted);
  }

  randomBytes(length: number): Uint8Array {
    return new Uint8Array(crypto.randomBytes(length));
  }

  randomUUID(): string {
    return crypto.randomUUID();
  }
}
