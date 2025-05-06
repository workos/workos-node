import { decodeUInt32 } from 'leb';
import { CryptoProvider } from '../../common/crypto/crypto-provider';

export interface Decoded {
  iv: Uint8Array;
  tag: Uint8Array;
  keys: string;
  ciphertext: Uint8Array;
}

export const decrypt = async (
  payload: string | Decoded,
  dataKey: string,
  aad: string,
  cryptoProvider: CryptoProvider,
): Promise<string> => {
  // Decode the payload if it's a string
  const decoded = typeof payload === 'string' ? decode(payload) : payload;
  const { iv, tag, ciphertext } = decoded;

  // Convert inputs
  const keyBytes = Uint8Array.from(Buffer.from(dataKey, 'base64'));
  const aadBytes = new TextEncoder().encode(aad);

  // Use generic decryption method
  const decryptedBytes = await cryptoProvider.decrypt(
    ciphertext,
    keyBytes,
    iv,
    tag,
    aadBytes,
  );

  // Convert the result to a string
  return new TextDecoder().decode(decryptedBytes);
};

export const decode = (payload: string): Decoded => {
  const inputData = Buffer.from(payload, 'base64');
  const iv = new Uint8Array(inputData.slice(0, 32));
  const tag = new Uint8Array(inputData.slice(32, 48));
  const { value: keyLen, nextIndex } = decodeUInt32(inputData, 48);
  const keys = inputData
    .slice(nextIndex, nextIndex + keyLen)
    .toString('base64');
  const ciphertext = new Uint8Array(inputData.slice(nextIndex + keyLen));

  return {
    iv,
    tag,
    keys,
    ciphertext,
  };
};
