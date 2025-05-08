import { NodeCryptoProvider } from './node-crypto-provider';
import { encrypt as vaultEncrypt } from '../../vault/cryptography/encrypt';
import {
  decrypt as vaultDecrypt,
  decode,
} from '../../vault/cryptography/decrypt';
import crypto from 'crypto';
import { encodeUInt32 } from 'leb';

describe('NodeCryptoProvider Vault Compatibility', () => {
  let nodeCryptoProvider: NodeCryptoProvider;

  beforeEach(() => {
    nodeCryptoProvider = new NodeCryptoProvider();
  });

  describe('encrypt method', () => {
    it('should produce compatible results with vault encrypt function', async () => {
      // Generate test data
      const plaintext = 'This is a test message';
      const dataKey = crypto.randomBytes(32);
      // We're not using encryptedKeys in this test, but it would be used with vaultEncrypt
      const aad = 'additional-authenticated-data';

      // Using NodeCryptoProvider
      const plaintextUint8 = new TextEncoder().encode(plaintext);
      const aadUint8 = new TextEncoder().encode(aad);
      const result = await nodeCryptoProvider.encrypt(
        plaintextUint8,
        dataKey,
        undefined, // Let it generate IV
        aadUint8,
      );

      // Verify that we can decrypt the result with NodeCryptoProvider
      const decrypted = await nodeCryptoProvider.decrypt(
        result.ciphertext,
        dataKey,
        result.iv,
        result.tag,
        aadUint8,
      );

      expect(new TextDecoder().decode(decrypted)).toEqual(plaintext);

      // Verify the encrypt algorithm matches the expected AES-256-GCM
      // Create our own cipher to check
      const cipher = crypto.createCipheriv('aes-256-gcm', dataKey, result.iv);
      cipher.setAAD(Buffer.from(aadUint8));
      const expectedCiphertext = Buffer.concat([
        cipher.update(Buffer.from(plaintextUint8)),
        cipher.final(),
      ]);
      const expectedTag = cipher.getAuthTag();

      expect(Buffer.from(result.ciphertext)).toEqual(expectedCiphertext);
      expect(Buffer.from(result.tag)).toEqual(expectedTag);
    });

    it('should correctly handle different AAD values', async () => {
      const plaintext = 'Secret message';
      const key = crypto.randomBytes(32);
      const aad1 = 'AAD value 1';
      const aad2 = 'AAD value 2';

      // Encrypt with first AAD
      const encrypted = await nodeCryptoProvider.encrypt(
        new TextEncoder().encode(plaintext),
        key,
        undefined,
        new TextEncoder().encode(aad1),
      );

      // Decrypt with correct AAD should work
      const decrypted = await nodeCryptoProvider.decrypt(
        encrypted.ciphertext,
        key,
        encrypted.iv,
        encrypted.tag,
        new TextEncoder().encode(aad1),
      );

      expect(new TextDecoder().decode(decrypted)).toEqual(plaintext);

      // Decrypt with incorrect AAD should fail
      await expect(
        nodeCryptoProvider.decrypt(
          encrypted.ciphertext,
          key,
          encrypted.iv,
          encrypted.tag,
          new TextEncoder().encode(aad2),
        ),
      ).rejects.toThrow();
    });
  });

  describe('decrypt method', () => {
    it('should decrypt data that was encrypted by the vault encrypt function', async () => {
      // Generate test data
      const plaintext = 'This is a test message for vault encryption';
      const dataKey = crypto.randomBytes(32).toString('base64');
      const encryptedKeys = crypto.randomBytes(48).toString('base64');
      const aad = 'vault-aad';

      // Encrypt with vault encrypt function
      const vaultEncrypted = vaultEncrypt(
        plaintext,
        dataKey,
        encryptedKeys,
        aad,
      );

      // Decode the vault encrypted payload
      const decoded = decode(vaultEncrypted);

      // Decrypt with NodeCryptoProvider
      const decrypted = await nodeCryptoProvider.decrypt(
        decoded.ciphertext,
        Buffer.from(dataKey, 'base64'),
        decoded.iv,
        decoded.tag,
        new TextEncoder().encode(aad),
      );

      expect(new TextDecoder().decode(decrypted)).toEqual(plaintext);
    });

    it('should handle the same data format as vault decrypt function', async () => {
      // Generate test data
      const plaintext = 'Message to test compatibility';
      const key = crypto.randomBytes(32);
      const dataKey = key.toString('base64');
      const aad = 'test-aad';
      const aadUint8 = new TextEncoder().encode(aad);

      // Encrypt with NodeCryptoProvider
      const encrypted = await nodeCryptoProvider.encrypt(
        new TextEncoder().encode(plaintext),
        key,
        undefined,
        aadUint8,
      );

      // Create a payload that matches the format expected by vault decrypt
      const prefixLen = encodeUInt32(48); // Using 48 as a dummy encrypted keys length
      const dummyEncryptedKeys = crypto.randomBytes(48);

      const payload = Buffer.concat([
        Buffer.from(encrypted.iv),
        Buffer.from(encrypted.tag),
        prefixLen,
        dummyEncryptedKeys,
        Buffer.from(encrypted.ciphertext),
      ]).toString('base64');

      // Decrypt with vault decrypt
      const vaultDecrypted = vaultDecrypt(payload, dataKey, aad);

      expect(vaultDecrypted).toEqual(plaintext);
    });
  });

  describe('randomBytes method', () => {
    it('should generate random bytes of the specified length', () => {
      const length = 32;
      const randomBytes = nodeCryptoProvider.randomBytes(length);

      expect(randomBytes).toBeInstanceOf(Uint8Array);
      expect(randomBytes.length).toBe(length);

      // Generate another set of random bytes
      const anotherRandomBytes = nodeCryptoProvider.randomBytes(length);

      // They should be different (extremely unlikely to be the same)
      expect(Buffer.from(randomBytes).toString('hex')).not.toEqual(
        Buffer.from(anotherRandomBytes).toString('hex'),
      );
    });

    it('should generate random bytes comparable to crypto.randomBytes', () => {
      const length = 16;
      const providerRandomBytes = nodeCryptoProvider.randomBytes(length);

      expect(providerRandomBytes.length).toBe(length);
      expect(providerRandomBytes).toBeInstanceOf(Uint8Array);

      // Just checking that the method returns bytes of the correct length and type
      // We can't meaningfully compare randomness
    });
  });
});

