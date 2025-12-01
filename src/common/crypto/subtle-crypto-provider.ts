import { CryptoProvider } from './crypto-provider';

/**
 * `CryptoProvider which uses the SubtleCrypto interface of the Web Crypto API.
 *
 * This only supports asynchronous operations.
 */
export class SubtleCryptoProvider extends CryptoProvider {
  subtleCrypto: SubtleCrypto;

  constructor(subtleCrypto?: SubtleCrypto) {
    super();

    // If no subtle crypto is interface, default to the global namespace. This
    // is to allow custom interfaces (eg. using the Node webcrypto interface in
    // tests).
    this.subtleCrypto = subtleCrypto || crypto.subtle;
  }

  computeHMACSignature(_payload: string, _secret: string): string {
    throw new Error(
      'SubleCryptoProvider cannot be used in a synchronous context.',
    );
  }

  /** @override */
  async computeHMACSignatureAsync(
    payload: string,
    secret: string,
  ): Promise<string> {
    const encoder = new TextEncoder();

    const key = await this.subtleCrypto.importKey(
      'raw',
      encoder.encode(secret),
      {
        name: 'HMAC',
        hash: { name: 'SHA-256' },
      },
      false,
      ['sign'],
    );

    const signatureBuffer = await this.subtleCrypto.sign(
      'hmac',
      key,
      encoder.encode(payload),
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

  /** @override */
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
    const actualIv = iv || crypto.getRandomValues(new Uint8Array(32));

    const cryptoKey = await this.subtleCrypto.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['encrypt'],
    );

    const encryptParams: AesGcmParams = {
      name: 'AES-GCM',
      iv: actualIv,
    };

    if (aad) {
      encryptParams.additionalData = aad;
    }

    const encryptedData = await this.subtleCrypto.encrypt(
      encryptParams,
      cryptoKey,
      plaintext,
    );

    const encryptedBytes = new Uint8Array(encryptedData);

    // Extract tag (last 16 bytes)
    const tagSize = 16;
    const tagStart = encryptedBytes.length - tagSize;
    const tag = encryptedBytes.slice(tagStart);
    const ciphertext = encryptedBytes.slice(0, tagStart);

    return {
      ciphertext,
      iv: actualIv,
      tag,
    };
  }

  async decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array,
    tag: Uint8Array,
    aad?: Uint8Array,
  ): Promise<Uint8Array> {
    // SubtleCrypto expects tag to be appended to ciphertext for AES-GCM
    const combinedData = new Uint8Array(ciphertext.length + tag.length);
    combinedData.set(ciphertext, 0);
    combinedData.set(tag, ciphertext.length);

    const cryptoKey = await this.subtleCrypto.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    );

    const decryptParams: AesGcmParams = {
      name: 'AES-GCM',
      iv,
    };

    if (aad) {
      decryptParams.additionalData = aad;
    }

    const decryptedData = await this.subtleCrypto.decrypt(
      decryptParams,
      cryptoKey,
      combinedData,
    );

    return new Uint8Array(decryptedData);
  }

  randomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  randomUUID(): string {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }

    // Fallback for environments without crypto.randomUUID
    const bytes = this.randomBytes(16);
    // tslint:disable-next-line:no-bitwise
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    // tslint:disable-next-line:no-bitwise
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant

    const hex = Array.from(bytes, (b) => byteHexMapping[b]).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16,
    )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
}

// Cached mapping of byte to hex representation. We do this once to avoid re-
// computing every time we need to convert the result of a signature to hex.
const byteHexMapping = new Array(256);
for (let i = 0; i < byteHexMapping.length; i++) {
  byteHexMapping[i] = i.toString(16).padStart(2, '0');
}
