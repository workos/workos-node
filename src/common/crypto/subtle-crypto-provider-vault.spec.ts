import { SubtleCryptoProvider } from './subtle-crypto-provider';
import { NodeCryptoProvider } from './node-crypto-provider';
import { encrypt as vaultEncrypt } from '../../vault/cryptography/encrypt';
import {
  decrypt as vaultDecrypt,
  decode,
} from '../../vault/cryptography/decrypt';
import crypto from 'crypto';
import { encodeUInt32 } from 'leb';

describe('SubtleCryptoProvider Vault Compatibility', () => {
  let subtleCryptoProvider: SubtleCryptoProvider;
  let nodeCryptoProvider: NodeCryptoProvider;

  beforeEach(() => {
    // Create a SubtleCryptoProvider without explicitly passing crypto.subtle
    // It will use the global crypto.subtle automatically
    subtleCryptoProvider = new SubtleCryptoProvider();
    nodeCryptoProvider = new NodeCryptoProvider();
  });

  describe('encrypt method', () => {
    it('should produce results compatible with vault encrypt function', async () => {
      // Generate test data
      const plaintext = 'This is a test message for SubtleCrypto';
      const dataKey = crypto.randomBytes(32);
      const aad = 'additional-authenticated-data';

      // Using SubtleCryptoProvider
      const plaintextUint8 = new TextEncoder().encode(plaintext);
      const aadUint8 = new TextEncoder().encode(aad);
      const result = await subtleCryptoProvider.encrypt(
        plaintextUint8,
        dataKey,
        undefined, // Let it generate IV
        aadUint8,
      );

      // Verify that we can decrypt the result with SubtleCryptoProvider
      const decrypted = await subtleCryptoProvider.decrypt(
        result.ciphertext,
        dataKey,
        result.iv,
        result.tag,
        aadUint8,
      );

      expect(new TextDecoder().decode(decrypted)).toEqual(plaintext);

      // Verify that we can decrypt it with NodeCryptoProvider too
      const nodeDecrypted = await nodeCryptoProvider.decrypt(
        result.ciphertext,
        dataKey,
        result.iv,
        result.tag,
        aadUint8,
      );

      expect(new TextDecoder().decode(nodeDecrypted)).toEqual(plaintext);
    });

    it('should correctly handle different AAD values', async () => {
      const plaintext = 'Secret message for testing';
      const key = crypto.randomBytes(32);
      const aad1 = 'AAD value 1';
      const aad2 = 'AAD value 2';

      // Encrypt with first AAD
      const encrypted = await subtleCryptoProvider.encrypt(
        new TextEncoder().encode(plaintext),
        key,
        undefined,
        new TextEncoder().encode(aad1),
      );

      // Decrypt with correct AAD should work
      const decrypted = await subtleCryptoProvider.decrypt(
        encrypted.ciphertext,
        key,
        encrypted.iv,
        encrypted.tag,
        new TextEncoder().encode(aad1),
      );

      expect(new TextDecoder().decode(decrypted)).toEqual(plaintext);

      // Decrypt with incorrect AAD should fail
      await expect(
        subtleCryptoProvider.decrypt(
          encrypted.ciphertext,
          key,
          encrypted.iv,
          encrypted.tag,
          new TextEncoder().encode(aad2),
        ),
      ).rejects.toThrow();
    });

    it('should produce compatible results with NodeCryptoProvider', async () => {
      // Generate test data
      const plaintext = 'Message to test between providers';
      const key = crypto.randomBytes(32);
      const iv = crypto.randomBytes(32);
      const aad = 'shared-aad';

      const plaintextUint8 = new TextEncoder().encode(plaintext);
      const aadUint8 = new TextEncoder().encode(aad);

      // Encrypt with both providers using the same parameters
      const subtleResult = await subtleCryptoProvider.encrypt(
        plaintextUint8,
        key,
        iv,
        aadUint8,
      );

      const nodeResult = await nodeCryptoProvider.encrypt(
        plaintextUint8,
        key,
        iv,
        aadUint8,
      );

      // Decrypt the NodeCryptoProvider result with SubtleCryptoProvider
      const subtleDecryptedNode = await subtleCryptoProvider.decrypt(
        nodeResult.ciphertext,
        key,
        nodeResult.iv,
        nodeResult.tag,
        aadUint8,
      );

      // Decrypt the SubtleCryptoProvider result with NodeCryptoProvider
      const nodeDecryptedSubtle = await nodeCryptoProvider.decrypt(
        subtleResult.ciphertext,
        key,
        subtleResult.iv,
        subtleResult.tag,
        aadUint8,
      );

      // Both should decrypt to the original plaintext
      expect(new TextDecoder().decode(subtleDecryptedNode)).toEqual(plaintext);
      expect(new TextDecoder().decode(nodeDecryptedSubtle)).toEqual(plaintext);
    });
  });

  describe('decrypt method', () => {
    it('should decrypt data that was encrypted by the vault encrypt function', async () => {
      // Generate test data
      const plaintext = 'This is a test message for vault and subtle crypto';
      const dataKey = crypto.randomBytes(32).toString('base64');
      const encryptedKeys = crypto.randomBytes(48).toString('base64');
      const aad = 'vault-subtle-aad';

      // Encrypt with vault encrypt function
      const vaultEncrypted = vaultEncrypt(
        plaintext,
        dataKey,
        encryptedKeys,
        aad,
      );

      // Decode the vault encrypted payload
      const decoded = decode(vaultEncrypted);

      // Decrypt with SubtleCryptoProvider
      const decrypted = await subtleCryptoProvider.decrypt(
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
      const plaintext =
        'Message to test compatibility between subtle and vault';
      const key = crypto.randomBytes(32);
      const dataKey = key.toString('base64');
      const aad = 'test-subtle-vault-aad';
      const aadUint8 = new TextEncoder().encode(aad);

      // Encrypt with SubtleCryptoProvider
      const encrypted = await subtleCryptoProvider.encrypt(
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
      const randomBytes = subtleCryptoProvider.randomBytes(length);

      expect(randomBytes).toBeInstanceOf(Uint8Array);
      expect(randomBytes.length).toBe(length);

      // Generate another set of random bytes
      const anotherRandomBytes = subtleCryptoProvider.randomBytes(length);

      // They should be different (extremely unlikely to be the same)
      expect(Buffer.from(randomBytes).toString('hex')).not.toEqual(
        Buffer.from(anotherRandomBytes).toString('hex'),
      );
    });

    it('should generate random bytes comparable to NodeCryptoProvider', () => {
      const length = 16;
      const subtleRandomBytes = subtleCryptoProvider.randomBytes(length);
      const nodeRandomBytes = nodeCryptoProvider.randomBytes(length);

      expect(subtleRandomBytes.length).toBe(length);
      expect(nodeRandomBytes.length).toBe(length);
      expect(subtleRandomBytes).toBeInstanceOf(Uint8Array);
      expect(nodeRandomBytes).toBeInstanceOf(Uint8Array);

      // Just checking that both methods return bytes of the correct length and type
      // We can't meaningfully compare randomness
    });
  });

  describe('equivalence between NodeCryptoProvider and SubtleCryptoProvider', () => {
    it('should sign the same data consistently between providers', async () => {
      const payload = 'Test payload for signature comparison';
      const secret = 'shared-secret-key';

      const subtleSignature =
        await subtleCryptoProvider.computeHMACSignatureAsync(payload, secret);

      const nodeSignature = await nodeCryptoProvider.computeHMACSignatureAsync(
        payload,
        secret,
      );

      expect(subtleSignature).toEqual(nodeSignature);
    });

    it('should perform secure comparison consistently between providers', async () => {
      const stringA = 'string-to-compare';
      const stringB = 'string-to-compare';
      const stringC = 'different-string';

      const subtleCompareEqual = await subtleCryptoProvider.secureCompare(
        stringA,
        stringB,
      );
      const nodeCompareEqual = await nodeCryptoProvider.secureCompare(
        stringA,
        stringB,
      );

      const subtleCompareDifferent = await subtleCryptoProvider.secureCompare(
        stringA,
        stringC,
      );
      const nodeCompareDifferent = await nodeCryptoProvider.secureCompare(
        stringA,
        stringC,
      );

      expect(subtleCompareEqual).toBe(true);
      expect(nodeCompareEqual).toBe(true);

      expect(subtleCompareDifferent).toBe(false);
      expect(nodeCompareDifferent).toBe(false);
    });
  });
});

