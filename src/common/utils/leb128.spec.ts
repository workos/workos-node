import { encodeUInt32, decodeUInt32 } from './leb128';

describe('leb128', () => {
  describe('encodeUInt32', () => {
    describe('boundary values', () => {
      test('encodes 0 (1 byte: 0x00)', () => {
        const result = encodeUInt32(0);
        expect(result).toEqual(new Uint8Array([0x00]));
      });

      test('encodes 127 (1 byte: 0x7F) - largest 1-byte value', () => {
        const result = encodeUInt32(127);
        expect(result).toEqual(new Uint8Array([0x7f]));
      });

      test('encodes 128 (2 bytes: 0x80 0x01) - smallest 2-byte value', () => {
        const result = encodeUInt32(128);
        expect(result).toEqual(new Uint8Array([0x80, 0x01]));
      });

      test('encodes 16383 (2 bytes: 0xFF 0x7F) - largest 2-byte value', () => {
        const result = encodeUInt32(16383);
        expect(result).toEqual(new Uint8Array([0xff, 0x7f]));
      });

      test('encodes 16384 (3 bytes: 0x80 0x80 0x01)', () => {
        const result = encodeUInt32(16384);
        expect(result).toEqual(new Uint8Array([0x80, 0x80, 0x01]));
      });

      test('encodes 2097151 (3 bytes: 0xFF 0xFF 0x7F)', () => {
        const result = encodeUInt32(2097151);
        expect(result).toEqual(new Uint8Array([0xff, 0xff, 0x7f]));
      });

      test('encodes 2097152 (4 bytes: 0x80 0x80 0x80 0x01)', () => {
        const result = encodeUInt32(2097152);
        expect(result).toEqual(new Uint8Array([0x80, 0x80, 0x80, 0x01]));
      });

      test('encodes 268435455 (4 bytes: 0xFF 0xFF 0xFF 0x7F)', () => {
        const result = encodeUInt32(268435455);
        expect(result).toEqual(new Uint8Array([0xff, 0xff, 0xff, 0x7f]));
      });

      test('encodes 268435456 (5 bytes: 0x80 0x80 0x80 0x80 0x01)', () => {
        const result = encodeUInt32(268435456);
        expect(result).toEqual(new Uint8Array([0x80, 0x80, 0x80, 0x80, 0x01]));
      });

      test('encodes 4294967295 (5 bytes: 0xFF 0xFF 0xFF 0xFF 0x0F) - MAX_UINT32', () => {
        const result = encodeUInt32(4294967295);
        expect(result).toEqual(new Uint8Array([0xff, 0xff, 0xff, 0xff, 0x0f]));
      });
    });

    describe('common values', () => {
      test('encodes 42', () => {
        const result = encodeUInt32(42);
        expect(result).toEqual(new Uint8Array([0x2a]));
      });

      test('encodes 300', () => {
        const result = encodeUInt32(300);
        expect(result).toEqual(new Uint8Array([0xac, 0x02]));
      });

      test('encodes 1000000', () => {
        const result = encodeUInt32(1000000);
        expect(result).toEqual(new Uint8Array([0xc0, 0x84, 0x3d]));
      });
    });

    describe('invalid inputs', () => {
      test('throws for negative numbers', () => {
        expect(() => encodeUInt32(-1)).toThrow('Value must be non-negative');
      });

      test('throws for numbers > MAX_UINT32', () => {
        expect(() => encodeUInt32(4294967296)).toThrow('Value must not exceed 4294967295');
      });

      test('throws for non-integers', () => {
        expect(() => encodeUInt32(3.14)).toThrow('Value must be an integer');
      });

      test('throws for NaN', () => {
        expect(() => encodeUInt32(NaN)).toThrow('Value must be a finite number');
      });

      test('throws for Infinity', () => {
        expect(() => encodeUInt32(Infinity)).toThrow('Value must be a finite number');
      });
    });
  });

  describe('decodeUInt32', () => {
    describe('round-trip verification', () => {
      test('round-trips encode/decode for 0', () => {
        const encoded = encodeUInt32(0);
        const { value, nextIndex } = decodeUInt32(encoded);
        expect(value).toBe(0);
        expect(nextIndex).toBe(1);
      });

      test('round-trips encode/decode for 127', () => {
        const encoded = encodeUInt32(127);
        const { value, nextIndex } = decodeUInt32(encoded);
        expect(value).toBe(127);
        expect(nextIndex).toBe(1);
      });

      test('round-trips encode/decode for 128', () => {
        const encoded = encodeUInt32(128);
        const { value, nextIndex } = decodeUInt32(encoded);
        expect(value).toBe(128);
        expect(nextIndex).toBe(2);
      });

      test('round-trips encode/decode for 16383', () => {
        const encoded = encodeUInt32(16383);
        const { value, nextIndex } = decodeUInt32(encoded);
        expect(value).toBe(16383);
        expect(nextIndex).toBe(2);
      });

      test('round-trips encode/decode for 300', () => {
        const encoded = encodeUInt32(300);
        const { value, nextIndex } = decodeUInt32(encoded);
        expect(value).toBe(300);
        expect(nextIndex).toBe(2);
      });

      test('round-trips encode/decode for 1000000', () => {
        const encoded = encodeUInt32(1000000);
        const { value, nextIndex } = decodeUInt32(encoded);
        expect(value).toBe(1000000);
        expect(nextIndex).toBe(3);
      });

      test('round-trips encode/decode for MAX_UINT32', () => {
        const encoded = encodeUInt32(4294967295);
        const { value, nextIndex } = decodeUInt32(encoded);
        expect(value).toBe(4294967295);
        expect(nextIndex).toBe(5);
      });

      test('round-trips 1000 random values between 0 and 1000000', () => {
        for (let i = 0; i < 1000; i++) {
          const original = Math.floor(Math.random() * 1000000);
          const encoded = encodeUInt32(original);
          const { value } = decodeUInt32(encoded);
          expect(value).toBe(original);
        }
      });
    });

    describe('offset handling', () => {
      test('decodes from offset 0 by default', () => {
        const data = new Uint8Array([0x2a]); // 42
        const { value, nextIndex } = decodeUInt32(data);
        expect(value).toBe(42);
        expect(nextIndex).toBe(1);
      });

      test('decodes from specified offset', () => {
        const data = new Uint8Array([0xff, 0xff, 0xac, 0x02]); // garbage, then 300
        const { value, nextIndex } = decodeUInt32(data, 2);
        expect(value).toBe(300);
        expect(nextIndex).toBe(4);
      });

      test('returns correct nextIndex after decoding', () => {
        const data = encodeUInt32(128);
        const { nextIndex } = decodeUInt32(data);
        expect(nextIndex).toBe(2);
      });

      test('decodes multiple values in sequence using nextIndex', () => {
        // Encode three values: 42, 300, 1000000
        const encoded1 = encodeUInt32(42);
        const encoded2 = encodeUInt32(300);
        const encoded3 = encodeUInt32(1000000);

        // Concatenate into single buffer
        const buffer = new Uint8Array(
          encoded1.length + encoded2.length + encoded3.length,
        );
        buffer.set(encoded1, 0);
        buffer.set(encoded2, encoded1.length);
        buffer.set(encoded3, encoded1.length + encoded2.length);

        // Decode sequentially
        const result1 = decodeUInt32(buffer, 0);
        expect(result1.value).toBe(42);

        const result2 = decodeUInt32(buffer, result1.nextIndex);
        expect(result2.value).toBe(300);

        const result3 = decodeUInt32(buffer, result2.nextIndex);
        expect(result3.value).toBe(1000000);
      });
    });

    describe('invalid inputs', () => {
      test('throws for offset beyond buffer bounds', () => {
        const data = new Uint8Array([0x2a]);
        expect(() => decodeUInt32(data, 5)).toThrow('Offset 5 is out of bounds');
      });

      test('throws for negative offset', () => {
        const data = new Uint8Array([0x2a]);
        expect(() => decodeUInt32(data, -1)).toThrow('Offset -1 is out of bounds');
      });

      test('throws for truncated encoding (incomplete byte sequence)', () => {
        // Create a truncated encoding: 0x80 indicates more bytes follow, but none present
        const data = new Uint8Array([0x80]);
        expect(() => decodeUInt32(data)).toThrow('Truncated LEB128 encoding');
      });

      test('throws for truncated multi-byte encoding', () => {
        // 0x80 0x80 indicates at least 3 bytes needed, but only 2 present
        const data = new Uint8Array([0x80, 0x80]);
        expect(() => decodeUInt32(data)).toThrow('Truncated LEB128 encoding');
      });

      test('throws for encoding that exceeds uint32 range', () => {
        // 6 bytes with continuation bits (should never happen for uint32)
        const data = new Uint8Array([0x80, 0x80, 0x80, 0x80, 0x80, 0x01]);
        expect(() => decodeUInt32(data)).toThrow('LEB128 sequence exceeds maximum length for uint32');
      });
    });
  });

  describe('compatibility with leb package', () => {
    // These tests ensure wire-format compatibility with the original leb package
    // If these tests pass, existing encrypted data can be decrypted after the migration

    test('produces identical output to leb.encodeUInt32 for value 42', () => {
      const result = encodeUInt32(42);
      // Known output from leb package
      expect(result).toEqual(new Uint8Array([0x2a]));
    });

    test('produces identical output to leb.encodeUInt32 for value 300', () => {
      const result = encodeUInt32(300);
      // Known output from leb package
      expect(result).toEqual(new Uint8Array([0xac, 0x02]));
    });

    test('produces identical output to leb.encodeUInt32 for value 1000000', () => {
      const result = encodeUInt32(1000000);
      // Known output from leb package
      expect(result).toEqual(new Uint8Array([0xc0, 0x84, 0x3d]));
    });

    test('decodes leb.encodeUInt32 output correctly', () => {
      // These are known outputs from the leb package
      const knownEncodings: Array<[number, number[]]> = [
        [0, [0x00]],
        [42, [0x2a]],
        [127, [0x7f]],
        [128, [0x80, 0x01]],
        [300, [0xac, 0x02]],
        [1000000, [0xc0, 0x84, 0x3d]],
        [4294967295, [0xff, 0xff, 0xff, 0xff, 0x0f]],
      ];

      for (const [expectedValue, bytes] of knownEncodings) {
        const { value } = decodeUInt32(new Uint8Array(bytes));
        expect(value).toBe(expectedValue);
      }
    });
  });
});
