import crypto from 'crypto';
import { encodeUInt32 } from 'leb';

export const encrypt = (
  data: string,
  dataKey: string,
  encryptedKeys: string,
): string => {
  // encrypt using the returned data key
  const key = Buffer.from(dataKey, 'base64');
  const keyBlob = Buffer.from(encryptedKeys, 'base64');
  const prefixLen = encodeUInt32(keyBlob.length);
  const iv = crypto.randomBytes(32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // store the encrypted keys with the ciphertext
  const payload = Buffer.concat([
    iv,
    tag,
    prefixLen,
    keyBlob,
    ciphertext,
  ]).toString('base64');
  return payload;
};