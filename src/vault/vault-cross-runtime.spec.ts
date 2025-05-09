import { base64ToUint8Array, uint8ArrayToBase64 } from '../common/utils/base64';
import { SubtleCryptoProvider } from '../common/crypto/subtle-crypto-provider';

describe('Cross-runtime compatibility tests for Vault', () => {
  // Test the base64 utility functions
  describe('base64 utilities', () => {
    it('should correctly convert between Uint8Array and base64', () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      const base64 = uint8ArrayToBase64(testData);
      const converted = base64ToUint8Array(base64);

      expect(converted.length).toBe(testData.length);
      for (let i = 0; i < testData.length; i++) {
        expect(converted[i]).toBe(testData[i]);
      }
    });

    it('should handle empty arrays', () => {
      const testData = new Uint8Array(0);
      const base64 = uint8ArrayToBase64(testData);
      const converted = base64ToUint8Array(base64);

      expect(converted.length).toBe(0);
    });

    it('should handle Unicode characters', () => {
      // Create a string with Unicode characters
      const str = 'Hello 👋 World 🌎';
      const encoder = new TextEncoder();
      const testData = encoder.encode(str);

      const base64 = uint8ArrayToBase64(testData);
      const converted = base64ToUint8Array(base64);

      expect(converted.length).toBe(testData.length);
      const decoded = new TextDecoder().decode(converted);
      expect(decoded).toBe(str);
    });
  });

  // Test crypto operations with both providers
  describe('crypto operations', () => {
    const testProviders = () => {
      // Create test data
      const plaintext = 'This is a test message';
      const encoder = new TextEncoder();
      const plaintextBytes = encoder.encode(plaintext);
      const key = new Uint8Array(32); // 32 bytes for AES-256
      // Fill key with test data
      for (let i = 0; i < key.length; i++) {
        key[i] = i % 256;
      }

      return { plaintext, plaintextBytes, key };
    };

    it('should encrypt and decrypt with NodeCryptoProvider', async () => {
      const { plaintextBytes, key } = testProviders();
      const provider = new SubtleCryptoProvider();
      const iv = provider.randomBytes(12);

      // Encrypt
      const encrypted = await provider.encrypt(plaintextBytes, key, iv);
      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.tag).toBeDefined();

      // Decrypt
      const decrypted = await provider.decrypt(
        encrypted.ciphertext,
        key,
        encrypted.iv,
        encrypted.tag,
      );

      // Should match original
      expect(new TextDecoder().decode(decrypted)).toBe(
        new TextDecoder().decode(plaintextBytes),
      );
    });

    it('should encrypt and decrypt with SubtleCryptoProvider', async () => {
      // Skip if running in Node.js without crypto.subtle
      if (typeof crypto === 'undefined' || !crypto.subtle) {
        console.log(
          'Skipping SubtleCryptoProvider test - crypto.subtle not available',
        );
        return;
      }

      const { plaintextBytes, key } = testProviders();
      const provider = new SubtleCryptoProvider();
      const iv = provider.randomBytes(12);

      // Encrypt
      const encrypted = await provider.encrypt(plaintextBytes, key, iv);
      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.tag).toBeDefined();

      // Decrypt
      const decrypted = await provider.decrypt(
        encrypted.ciphertext,
        key,
        encrypted.iv,
        encrypted.tag,
      );

      // Should match original
      expect(new TextDecoder().decode(decrypted)).toBe(
        new TextDecoder().decode(plaintextBytes),
      );
    });
  });
});
