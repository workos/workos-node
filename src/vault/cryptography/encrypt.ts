import { encodeUInt32 } from 'leb';
import { CryptoProvider } from '../../common/crypto/crypto-provider';

export const encrypt = async (
  data: string,
  dataKey: string,
  encryptedKeys: string,
  aad: string,
  cryptoProvider: CryptoProvider,
): Promise<string> => {
  // Convert inputs
  const dataBytes = new TextEncoder().encode(data);
  const keyBytes = Uint8Array.from(Buffer.from(dataKey, 'base64'));
  const keyBlob = Uint8Array.from(Buffer.from(encryptedKeys, 'base64'));
  const aadBytes = new TextEncoder().encode(aad);

  // Encode key length
  const prefixLen = encodeUInt32(keyBlob.length);

  // Use generic encryption method
  const { ciphertext, iv, tag } = await cryptoProvider.encrypt(
    dataBytes,
    keyBytes,
    undefined, // Let the provider generate an IV
    aadBytes,
  );

  // Combine everything into the final payload format
  const payload = Buffer.concat([
    Buffer.from(iv),
    Buffer.from(tag),
    prefixLen,
    Buffer.from(keyBlob),
    Buffer.from(ciphertext),
  ]).toString('base64');

  return payload;
};
