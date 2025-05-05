import crypto from 'crypto';
import { decodeUInt32 } from 'leb';

export interface Decoded {
  iv: Buffer;
  tag: Buffer;
  keys: string;
  ciphertext: Buffer;
}

export const decrypt = (
  payload: string | Decoded,
  dataKey: string,
  aad: string,
): string => {
  if (typeof payload === 'string') {
    payload = decode(payload);
  }
  const { iv, tag, ciphertext } = payload;
  const key = Buffer.from(dataKey, 'base64');

  const decipher = crypto
    .createDecipheriv('aes-256-gcm', key, iv)
    .setAAD(Buffer.from(aad))
    .setAuthTag(tag);
  const decrypted =
    decipher.update(ciphertext, undefined, 'utf-8') + decipher.final('utf-8');
  return decrypted;
};

export const decode = (payload: string): Decoded => {
  const inputData = Buffer.from(payload, 'base64');
  const iv = inputData.slice(0, 32);
  const tag = inputData.slice(32, 48);
  const { value: keyLen, nextIndex } = decodeUInt32(inputData, 48);
  const keys = inputData
    .slice(nextIndex, nextIndex + keyLen)
    .toString('base64');
  const ciphertext = inputData.slice(nextIndex + keyLen);
  return {
    iv,
    tag,
    keys,
    ciphertext,
  };
};
