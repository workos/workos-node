import {
  CryptoProvider,
  CryptoProviderOnlySupportsAsyncError,
} from './CryptoProvider';

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

  /** @override */
  computeHMACSignature(_payload: string, _secret: string): string {
    throw new CryptoProviderOnlySupportsAsyncError(
      'SubtleCryptoProvider cannot be used in a synchronous context.',
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
}

// Cached mapping of byte to hex representation. We do this once to avoid re-
// computing every time we need to convert the result of a signature to hex.
const byteHexMapping = new Array(256);
for (let i = 0; i < byteHexMapping.length; i++) {
  byteHexMapping[i] = i.toString(16).padStart(2, '0');
}
